import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsernameById, getPostsByUserId } from "../api";
import { Card } from "react-bootstrap";

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  images: string[];
}

const Profile = () => {
  const [userName, setUserName] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [imageIndex, setImageIndex] = useState<Record<string, number>>({});
  const [isImageNavigating, setIsImageNavigating] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let userId = localStorage.getItem("user");

        if (!userId) {
          navigate("/login");
          return;
        }

        userId = userId.replace(/"/g, "");

        const response = await getUsernameById(userId);
        const username = (response.data as { username: string }).username;
        setUserName(username);

        const postsResponse = await getPostsByUserId(userId);
        setPosts(postsResponse.data as Post[]);
      } catch (error) {
        console.error("Error fetching user data or posts:", error);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleNextImage = (postId: string, imagesLength: number) => {
    setIsImageNavigating(true);
    setImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % imagesLength,
    }));
  };

  const handlePrevImage = (postId: string, imagesLength: number) => {
    setIsImageNavigating(true);
    setImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + imagesLength) % imagesLength,
    }));
  };

  const handlePostClick = (postId: string) => {
    if (!isImageNavigating) {
      localStorage.setItem("selectedPostId", postId);
      navigate("/post");
    }
    setIsImageNavigating(false);
  };

  return (
    <div className="profile-container">
      <h1 style={{ textAlign: "center" }}>
        {userName ? `${userName}'s Profile` : "Loading..."}
      </h1>
      <hr />
      <h2 style={{ textAlign: "center" }}>Posts</h2>

      <div
        className="posts-list"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          overflowY: "auto", // אפשר לגלול
          maxHeight: "80vh", // גובה מקסימלי שיתפוס האזור של הפוסטים
        }}
      >
        {posts.length > 0 ? (
          posts.map((post) => {
            if (!(post._id in imageIndex)) {
              setImageIndex((prev) => ({ ...prev, [post._id]: 0 }));
            }

            return (
              <Card
                key={post._id}
                className="post-card"
                style={{
                  width: "250px", // רוחב הכרטיס
                  margin: "10px", // רווח בין הכרטיסים
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  height: "auto", // אפשר למנוע גובה קבוע ולהתאים לפי התוכן
                }}
                onClick={() => handlePostClick(post._id)}
              >
                <Card.Body
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {post.images.length > 0 && (
                    <div
                      className="position-relative"
                      style={{ width: "100%", height: "150px", overflow: "hidden" }}
                    >
                      <img
                        src={post.images[imageIndex[post._id]]}
                        alt="Post"
                        className="img-fluid rounded"
                        style={{
                          maxHeight: "200px",
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      {post.images.length > 1 && (
                        <>
                          <button
                            className="position-absolute top-50 start-0 translate-middle-y btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrevImage(post._id, post.images.length);
                            }}
                            style={{ left: "5px", backgroundColor: "#FF9800", color: "white" }}
                          >
                            ⏴
                          </button>

                          <button
                            className="position-absolute top-50 end-0 translate-middle-y btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextImage(post._id, post.images.length);
                            }}
                            style={{ right: "5px", backgroundColor: "#FF9800", color: "white" }}
                          >
                            ⏵
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  <Card.Title
                    style={{
                      textAlign: "center",
                      overflow: "hidden", // חותך את התוכן אם הוא יוצא
                      textOverflow: "ellipsis", // מוסיף "..." אם התוכן ארוך מדי
                      whiteSpace: "nowrap", // מונע שורה חדשה
                      width: "100%", // מבטיח שהתוכן יתפוס את כל הרוחב של הכרטיס
                    }}
                  >
                    {post.title}
                  </Card.Title>
                  <Card.Text
         style={{
          textAlign: "center",
          overflowY: "scroll", // גלילה אנכית
          overflowX: "hidden", // מחביא את הגלילה האופקית
          maxHeight: "150px", // גובה מקסימלי
          padding: "10px", // padding להרחבה
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 4, // מספר השורות המקסימלי
          width: "100%", // מבטיח שהתוכן יתפוס את כל הרוחב
          scrollbarWidth: "none", // מוסיף למחוק את גלגל הגלילה בכרום/פיירפוקס
          msOverflowStyle: "none", // מוסיף למחוק את גלגל הגלילה באינטרנט אקספלורר
        }}
                  >
                    {post.content}
                  </Card.Text>
                </Card.Body>
                <Card.Footer
                  style={{
                    textAlign: "center",
                    backgroundColor: "#f8f9fa", // רקע בהיר לתחתית הכרטיס
                    borderTop: "1px solid #e9ecef", // קו מופרד בין התוכן לתאריך
                  }}
                >
                  {new Date(post.createdAt).toLocaleDateString()}
                </Card.Footer>
              </Card>
            );
          })
        ) : (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
