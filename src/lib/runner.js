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

    await fs.writeFile(`./.runners/${id}.${extensions[lang]}`, code)
    await Util.exec(`docker cp .runners/${id}.${extensions[lang]} ${container.id}:/app/program.${extensions[lang]}`)
    await Util.exec(`docker start ${container.id}`)
    console.log(JSON.parse(await Util.exec(`docker inspect ${container.id}`))[0].State)
    console.log(await Util.exec(`docker logs ${container.id}`))
}


module.exports('node', '123123123')
