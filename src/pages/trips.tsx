import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { getAllPosts, getUsernameById } from "../api"; // יבוא פונקציות ה-API

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
  const [loading, setLoading] = useState<boolean>(true);
  const [usernames, setUsernames] = useState<Record<string, string>>({});

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

              return (
                <Card key={post._id} className="shadow-sm border-0 rounded-lg overflow-hidden mt-5 p-3">
                  <div className="d-flex justify-content-end text-muted" style={{ fontSize: "0.9rem" }}>
                    <span>
                      {new Date(post.createdAt).toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    
                  </div>
   {/* מיקום */}
   <div className="text-center">
                      <span className="d-flex justify-content-end text-muted" style={{ fontSize: "0.9rem" }}>Location: {post.location}</span>
                      
                    </div>
                  <div className="position-relative w-100 text-center">
                    {post.images.length > 0 ? (
                      <img
                        src={post.images[0]}
                        alt="Post"
                        className="img-fluid rounded w-100"
                        style={{ height: "300px", objectFit: "cover" }}
                      />
                    ) : (
                      <p></p>
                    )}
                  </div>

                  <Card.Body>
                    <h5 className="text-center my-2">{post.title}</h5>
                    <p className="text-center">{post.content}</p>

                    {/* שם המשתמש */}
                    <div className="text-left">
                      <span>👤 {usernames[post.userId] || "Loading..."}</span>
                    </div>

                 

                    <div className="d-flex justify-content-between mt-3 text-muted" style={{ gap: "20px" }}>
                      <span>⭐ {post.rating} / 5</span>
                      <span>❤️ {post.likes.length}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>

                    <div className="d-flex justify-content-center mt-3">
                      <Link to={`/post/${post._id}`} className="btn btn-primary w-auto">
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
