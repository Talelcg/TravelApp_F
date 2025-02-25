
import { useEffect, useState } from "react";
import { Card, Dropdown } from "react-bootstrap";
import { getPostById, getUsernameById, deletePost } from "../api";
import { useNavigate } from "react-router-dom";

interface Post {
  _id: string;
  title: string;
  content: string;
  userId: string;
  location: string;
  rating: number;
  images: string[];
  commentsCount: number;
  likes: string[];
  createdAt: string;
}

const PostDetails = () => {
  const postId = localStorage.getItem("selectedPostId");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        console.error("Post ID is undefined");
        setLoading(false);
        return;
      }
      try {
        const response = await getPostById(postId);
        const postData = response.data as Post;
        setPost(postData);
        const usernameResponse = await getUsernameById(postData.userId);
        const fetchedUsername = (usernameResponse.data as { username: string }).username;
        setUsername(fetchedUsername);

        // Get current user ID from localStorage
        const storedUserId = localStorage.getItem("user");
        setCurrentUserId(storedUserId ? storedUserId.replace(/"/g, '') : null);
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleEdit = () => {
    if (!postId) return;
    navigate('/edit-post/');
  };

  const handleDelete = async () => {
    if (!postId) return;
    try {
      await deletePost(postId);
      alert("Post deleted successfully");
      navigate("/trips"); // Return to home or another page after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete the post");
    }
  };

  const handleNextImage = () => {
    if (post) {
      setImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const handlePrevImage = () => {
    if (post) {
      setImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    }
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!post) {
    return <p className="text-center">Post not found</p>;
  }

  return (
    <div className="trips-container">
      <h1 style={{ textAlign: "center" }}>Post Details</h1>
      <Card className="shadow-sm border-0 rounded-lg overflow-hidden mt-5 p-3" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: "0.9rem", marginBottom: "10px" }}>
          {/* תאריך מימין */}
          <span>
            {new Date(post.createdAt).toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>

          {/* Show Dropdown only if the logged-in user is the post author */}
          {currentUserId === post.userId && (
            <Dropdown>
              <Dropdown.Toggle variant="secondary" size="sm" style={{ backgroundColor: "#FF9800", borderColor: "#FF9800" }} />
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
                <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* מיקום מתחת לתאריך */}
        <div className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "20px" }}>
          <span>{post.location}</span>
        </div>

        <div className="position-relative w-100 text-center">
          {post.images.length > 0 && (
            <div className="position-relative">
              <img src={post.images[imageIndex]} alt="Post" className="img-fluid rounded" style={{ width: "60%", height: "auto" }} />
              {post.images.length > 1 && (
                <>
                  <button className="position-absolute top-50 start-0 translate-middle-y btn" onClick={handlePrevImage} style={{ left: "5px", backgroundColor: "#FF9800", color: "white" }}>
                    ⏴
                  </button>
                  <button className="position-absolute top-50 end-0 translate-middle-y btn" onClick={handleNextImage} style={{ right: "5px", backgroundColor: "#FF9800", color: "white" }}>
                    ⏵
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <Card.Body style={{ position: "relative" }}>
          <h5 className="text-center my-2">{post.title}</h5>
          <p className="text-center">{post.content}</p>
          <div className="text-left">
            <span>👤 {username}</span>
          </div>

          <div className="d-flex justify-content-between mt-3 text-muted" style={{ gap: "20px" }}>
            <span>⭐ {post.rating} / 5</span>
            <span>❤️ {post.likes.length}</span>
            <span>💬 {post.commentsCount}</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PostDetails;
