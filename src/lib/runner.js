const Util = require('./Util')
const fs = require('fs/promises')

const extensions = {
    node: 'js'
}

module.exports = async (lang, code) => {
    if (!await new Promise(r=>require('fs').access('./.runners', require('fs').constants.F_OK, e => r(!e)))) await fs.mkdir('./.runners')

    const imgName = `pikostudio/judge-runner:${lang}`

    const image = (await Util.docker.listImages()).find(r=>r.RepoTags[0] === imgName)

    if (!image) return {
        error: `Language ${lang} is not supported.`
    }

    const id = Date.now()

    const container = await Util.docker.createContainer({
        Image: imgName,
        name: `judge-runner__${id}`
    })

    console.log(container.id)

    await fs.writeFile(`./.runners/${id}`, code)
    await Util.exec(`docker cp .runners/${id} ${container.id}:/app/program.${extensions[lang]}`)
    await fs.unlink(`./.runners/${id}`)
    await Util.exec(`docker start ${container.id}`)
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (JSON.parse(await Util.exec(`docker inspect ${container.id}`))[0].State.Running) {
        await Util.exec(`docker rm -f ${container.id}`)
        console.log(`Killed container ${container.id}`)
        return {state: 'TIMEOUT'}
    }
    const exitCode = JSON.parse(await Util.exec(`docker inspect ${container.id}`))[0].State.ExitCode
    let output = (await Util.exec(`docker logs ${container.id}`))
    while (output.endsWith('\n')) {
        output = output.slice(0,output.length-1)
    }
    await Util.exec(`docker rm ${container.id}`)
    return {output, status: 'SUCCESS', exitCode}
}


module.exports('node', 'console.log(123123123)').then(res => console.log(res))
