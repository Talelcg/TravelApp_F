import { useEffect, useState } from "react";
import { Card, Dropdown } from "react-bootstrap";
import { getPostById, getUsernameById, deletePost, toggleLikePost } from "../api";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import CommentsSection from "../models/CommentsSection"; 

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
  const [profileImage, setProfileImage] = useState<string>("");
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
        const fetchedProfileImage = (usernameResponse.data as { profileImage: string }).profileImage;
        setProfileImage(fetchedProfileImage);
        setUsername((usernameResponse.data as { username: string }).username);

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
const incrementCommentsCount = () => {
  setPost((prevPost) => 
    prevPost ? { ...prevPost, commentsCount: prevPost.commentsCount + 1 } : prevPost
  );
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

  const handleLikePost = async () => {
    try {
      if (!currentUserId) {
        alert("Please log in to like posts.");
        return;
      }
      if (postId) {
        await toggleLikePost(postId); // Call API function to toggle like
      } else {
        console.error("Post ID is null");
      }
      setPost((prevPost) => ({
        ...prevPost!,
        likes: prevPost!.likes.includes(currentUserId)
          ? prevPost!.likes.filter((id) => id !== currentUserId)
          : [...prevPost!.likes, currentUserId],
      }));
    } catch (error) {
      console.error("Error liking post:", error);
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
            <span><img
                      src={profileImage || "/profile_pictures/default.png"}
                      alt="User"
                      style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                      /> <span></span> {   username}</span>
          </div>
          
          <div className="d-flex justify-content-between mt-3 text-muted" style={{ gap: "20px" }}>
            <span>⭐ {post.rating} / 5</span>

            {/* Like Button */}
            <span
              style={{ cursor: 'pointer', alignItems: "center", gap: "8px", display: "flex" }}
              onClick={handleLikePost}
            >
              <FaHeart
                style={{
                  color: currentUserId && post.likes.includes(currentUserId) ? 'red' : 'gray', // Red if liked, gray if not
                  fontSize: '1.5rem',
                  transition: 'color 0.3s', // optional transition for smooth change
                }}
              />
              {post.likes.length}
            </span>

            <span>💬 {post.commentsCount}</span>
          </div>
        </Card.Body>
      </Card>

      {/* הוספת רכיב התגובות */}
      
<CommentsSection postId={postId!} incrementCommentsCount={incrementCommentsCount} currentUserId={""} />
    </div>
  );
};

export default PostDetails;
