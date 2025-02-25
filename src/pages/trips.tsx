import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Dropdown } from "react-bootstrap";
import { getAllPosts, getUsernameById, deletePost } from "../api"; // הוספתי את פונקציית ה-API למחיקת פוסט
import { FaEllipsisV } from "react-icons/fa";

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

const Trips = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [imageIndex, setImageIndex] = useState<Record<string, number>>({}); // שמירת אינדקס תמונה לכל פוסט
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // שמירת ה-ID של המשתמש הנוכחי

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getAllPosts();
        setPosts(response.data as Post[]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    // קביעת המשתמש הנוכחי
    const storedUserId = localStorage.getItem("user");
    setCurrentUserId(storedUserId ? storedUserId.replace(/"/g, '') : null);

    fetchPosts();
  }, []);

  // פונקציה לקבלת שם משתמש לפי userId
  const fetchUsername = async (userId: string) => {
    if (!usernames[userId]) {
      try {
        const response = await getUsernameById(userId);
        setUsernames((prev) => ({
          ...prev,
          [userId]: (response.data as { username: string }).username,
        }));
      } catch {
        setUsernames((prev) => ({
          ...prev,
          [userId]: "Unknown",
        }));
      }
    }
  };

  // שינוי אינדקס התמונה
  const handleNextImage = (postId: string, imagesLength: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % imagesLength,
    }));
  };

  const handlePrevImage = (postId: string, imagesLength: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + imagesLength) % imagesLength,
    }));
  };

  // פונקציה לשמירת ה-ID של הפוסט ב-localStorage
  const handleViewDetails = (postId: string) => {
    localStorage.setItem("selectedPostId", postId); // שמירת ה-ID ב-localStorage
  };

  // פונקציה לעריכה ומחיקה של הפוסט
  const handleEdit = (postId: string) => {
    // Save post ID to localStorage
    localStorage.setItem("selectedPostId", postId);
    navigate("/edit-post"); // Navigate to the upload post page for editing
  };
  

  // פונקציה למחיקת הפוסט
  const handleDelete = async (postId: string) => {
    try {
      // קריאה לפונקציית המחיקה
      await deletePost(postId); // קריאה לפונקציה שמבצעת את המחיקה ב-API
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId)); // עדכון המצב (state) כדי להוריד את הפוסט מהתצוגה
      console.log(`Post ${postId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="trips-container">
      <h1 style={{ textAlign: "center" }}>Explore Trips</h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : (
        <div className="trips-list">
          {posts.length === 0 ? (
            <p style={{ textAlign: "center" }}>No trips found</p>
          ) : (
            posts.map((post) => {
              if (!usernames[post.userId]) {
                fetchUsername(post.userId); // קריאה לפונקציה כאשר אין עדיין שם משתמש
              }

              // הגדרת אינדקס ברירת מחדל אם לא קיים
              if (!(post._id in imageIndex)) {
                setImageIndex((prev) => ({ ...prev, [post._id]: 0 }));
              }

              return (
                <Card
                  key={post._id}
                  className="shadow-sm border-0 rounded-lg overflow-hidden mt-5 p-3"
                  style={{ maxWidth: "600px", margin: "0 auto" }}
                >
                  <div
                    className="d-flex justify-content-between align-items-center text-muted"
                    style={{ fontSize: "0.9rem", marginBottom: "10px" }}
                  >
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
                        <Dropdown.Toggle
                          variant="secondary"
                          size="sm"
                          style={{ backgroundColor: "#FF9800", borderColor: "#FF9800" }}
                        >
                          <FaEllipsisV style={{ color: "white" }} /> {/* אייקון של שלוש נקודות */}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleEdit(post._id)}>Edit</Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDelete(post._id)}>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="d-flex justify-content-left text-muted" style={{ fontSize: "0.9rem" }}>
                      {post.location}
                    </span>
                  </div>

                  <div className="position-relative w-100 text-center">
                    {post.images.length > 0 && (
                      <div className="position-relative">
                        <img
                          src={post.images[imageIndex[post._id]]}
                          alt="Post"
                          className="img-fluid rounded"
                          style={{
                            width: "60%",
                            height: "auto",
                          }}
                        />
                        {post.images.length > 1 && (
                          <>
                            <button
                              className="position-absolute top-50 start-0 translate-middle-y btn"
                              onClick={() => handlePrevImage(post._id, post.images.length)}
                              style={{ left: "5px", backgroundColor: "#FF9800", color: "white" }}
                            >
                              ⏴
                            </button>

                            <button
                              className="position-absolute top-50 end-0 translate-middle-y btn "
                              onClick={() => handleNextImage(post._id, post.images.length)}
                              style={{ right: "5px", backgroundColor: "#FF9800", color: "white" }}
                            >
                              ⏵
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <Card.Body>
                    <h5 className="text-center my-2">{post.title}</h5>
                    <p className="text-center">{post.content}</p>

                    <div className="text-left">
                      <span>👤 {usernames[post.userId] || "Loading..."}</span>
                    </div>

                    <div className="d-flex justify-content-between mt-3 text-muted" style={{ gap: "20px" }}>
                      <span>⭐ {post.rating} / 5</span>
                      <span>❤️ {post.likes.length}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>

                    <div className="d-flex justify-content-center mt-3">
                      <Link
                        to="/post"
                        className="btn w-auto"
                        style={{ backgroundColor: "#FF9800", color: "white" }}
                        onClick={() => handleViewDetails(post._id)} 
                      >
                        View Details
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Trips;
