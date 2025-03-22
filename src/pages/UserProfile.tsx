import { useEffect, useState } from "react";
import { getUserById, getPostsByUserId, uploadProfilePicture, updateBio, updateUsername } from "../api";
import { Card, Form, Badge, Dropdown } from "react-bootstrap";
import { FaEllipsisV } from "react-icons/fa";
import { PencilSquare } from "react-bootstrap-icons";
import { deletePost } from "../api";
import { Link, useNavigate } from "react-router-dom";

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  images: string[];
  likes: string[];
  commentsCount: number;
  rating?: number;

}

const Profile = () => {
  const [userName, setUserName] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [newBio, setNewBio] = useState<string>("");
  const navigate = useNavigate();

  const handleEdit = (postId: string) => {
    localStorage.setItem("selectedPostId", postId);
    navigate("/edit-post");
  };
  const handleUsernameUpdate = async () => {
    try {
      let userId = localStorage.getItem("user")?.replace(/"/g, "");
      if (!userId || !newUsername) return;
  
      await updateUsername(userId, newUsername); // you can create a new function or reuse
      setUserName(newUsername);
      setIsEditingUsername(false);
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };
  

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let userId = localStorage.getItem("user");
        if (!userId) {
          navigate("/login");
          return;
        }

        userId = userId.replace(/"/g, "");

        const userResponse = await getUserById(userId);
        setUserName(userResponse.data.username);
        setNewUsername(userResponse.data.username);
        setEmail(userResponse.data.email);
        setBio(userResponse.data.bio);
        setProfileImage(userResponse.data.profileImage || "/profile_pictures/default.png");

        const postsResponse = await getPostsByUserId(userId);
        const formattedPosts = (postsResponse.data as Post[]).map((post) => ({
          ...post,
          images: post.images || [],
          commentsCount: post.commentsCount || 0,
          likes: Array.isArray(post.likes) ? post.likes : [],
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching user data or posts:", error);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let userId = localStorage.getItem("user")?.replace(/"/g, "");
      if (!userId) return;

      const response = await uploadProfilePicture(userId, file);
      const newProfilePicUrl = `${response.profileImage}`;
      setProfileImage(newProfilePicUrl);
      localStorage.setItem("profilePicture", newProfilePicUrl);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleBioUpdate = async () => {
    try {
      let userId = localStorage.getItem("user")?.replace(/"/g, "");
      if (!userId || !newBio) return;

      await updateBio(userId, newBio);
      setBio(newBio);
      setIsEditingBio(false);
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  return (
    <div className="profile-container" style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <div className="profile-header" style={{ textAlign: "center", padding: "20px", borderRadius: "15px", backgroundColor: "#f9f9f9", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", marginBottom: "20px", position: "relative" }}>
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "160px", height: "160px", borderRadius: "50%", border: "4px solid #ff9800", overflow: "hidden", position: "relative", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={`${profileImage}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <input type="file" accept="image/*" style={{ display: "none" }} id="profilePicUpload" onChange={handleProfilePictureUpload} />
          <label htmlFor="profilePicUpload">
            <PencilSquare size={24} color="#ff9800" style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "#fff", borderRadius: "50%", padding: "4px", cursor: "pointer" }} />
          </label>
        </div>

{/* Username (Editable with Pencil Icon) */}
{isEditingUsername ? (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "10px" }}>
    <Form.Control
      type="text"
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
      style={{ maxWidth: "250px" }}
    />
    <button className="btn btn-warning btn-sm" onClick={handleUsernameUpdate}>Save</button>
  </div>
) : (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "10px" }}>
    <h1 style={{ fontWeight: "bold", fontSize: "1.8rem", marginBottom: 0 }}>{userName}'s Profile</h1>
    <PencilSquare
      size={20}
      color="#ff9800"
      style={{ cursor: "pointer" }}
      onClick={() => {
        setNewUsername(userName);
        setIsEditingUsername(true);
      }}
    />
  </div>
)}


        <p style={{ fontSize: "1rem", color: "#999" }}>{email}</p>

        {isEditingBio ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
            <Form.Control type="text" value={newBio} onChange={(e) => setNewBio(e.target.value)} style={{ maxWidth: "400px" }} />
            <button className="btn btn-warning" onClick={handleBioUpdate}>Save</button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px", cursor: "pointer" }}>
            <p style={{ fontSize: "1.1rem", fontStyle: "italic", color: "#666" }} onClick={() => setIsEditingBio(true)}>{bio}</p>
            <PencilSquare size={20} color="#ff9800" onClick={() => setIsEditingBio(true)} />
          </div>
        )}
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "15px" }}>My Posts</h2>
      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post._id} className="shadow-sm border-0 rounded-lg overflow-hidden mt-5 p-3" style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: "0.9rem", marginBottom: "10px" }}>
                <span>{new Date(post.createdAt).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", year: "numeric", month: "short", day: "numeric" })}</span>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" size="sm" style={{ backgroundColor: "#FF9800", borderColor: "#FF9800" }}>
                    <FaEllipsisV style={{ color: "white" }} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleEdit(post._id)}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDelete(post._id)}>Delete</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="position-relative w-100 text-center">
                {post.images.length > 0 && (
                  <div className="position-relative">
                    <img src={post.images[0]} alt="Post" className="img-fluid rounded" style={{ width: "60%", height: "auto" }} />
                  </div>
                )}
              </div>
              <Card.Body>
                <h5 className="text-center my-2">{post.title}</h5>
                <p className="text-center">{post.content}</p>
                <div className="d-flex justify-content-between mt-3 text-muted" style={{ gap: "20px" }}>
                <span>⭐ {post.rating ?? 0} / 5</span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>❤️ {post.likes.length}</span>
                <span>💬 {post.commentsCount || 0}</span>
                </div>
                <div className="d-flex justify-content-center mt-3">
                  <Link to="/post" className="btn w-auto" style={{ backgroundColor: "#FF9800", color: "white" }} onClick={() => { localStorage.setItem("selectedPostId", post._id); navigate("/post"); }}>View Details</Link>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#777" }}>No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;