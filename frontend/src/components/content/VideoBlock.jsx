export default function VideoBlock({ block }) {
  return (
    <div style={{ aspectRatio: '16 / 9', maxWidth: 640 }}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${block.video_youtube_id}`}
        title="Lesson video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
