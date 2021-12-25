// From tags JOIN tagvids

export interface VideoRow {
    id: number,
    youtube_id: string,
    duration: number
    level: number,
    tag: string
}