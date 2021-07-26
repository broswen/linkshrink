export default class LinkNotFoundError extends Error {

    constructor(slug: string) {
        super(`Link already exists: ${slug}`)
    }
}