/*import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../api"; // פונקציה לשלוף פוסט לפי ID

interface Post {
  _id: string;
  title: string;
  content: string;
  userId: string;
  location: string;
  rating: number;
  images: string[];
  comments: { user: string; content: string }[]; // התגובות
  createdAt: string;
}

const PostDetails = () => {
  const { postId } = useParams<{ postId: string }>(); // שליפת ה-ID מה-URL
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getPostById(postId); // שליפת הפוסט לפי ה-ID
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]); // שימוש ב-ID שמגיע מה-URL

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  return (
    <div className="post-details">
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <div>Location: {post.location}</div>
      <div>Rating: {post.rating} / 5</div>
      <div>Posted on: {new Date(post.createdAt).toLocaleString()}</div>

      {post.images.length > 0 && (
        <img src={post.images[0]} alt="Post" className="img-fluid rounded" />
      )}

      <div>
        <h3>Comments:</h3>
        {post.comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          post.comments.map((comment, index) => (
            <div key={index}>
              <p><strong>{comment.user}</strong>: {comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetails;
*/