// From tags JOIN tagvids

export default interface VideoItem {
  id: number;
  youtube_id: string;
  duration: number;
  level: number;
  tag: string;
}
