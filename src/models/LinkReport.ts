
interface LinkReport {
    slug: string
    reportKey: string
    start: Date
    stop: Date
    status: string
}

interface LinkReportEvent {
    slug: string
    reportKey: string
}

export { LinkReport, LinkReportEvent }