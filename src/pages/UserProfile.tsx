
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getUserById, getPostsByUserId, updateProfile } from "../api";
// import { Card, Button, Form, Modal, Badge } from "react-bootstrap";

// interface Post {
//   _id: string;
//   title: string;
//   content: string;
//   createdAt: string;
//   images: string[];
//   likes: string[];
//   commentsCount: number;
// }

// const Profile = () => {
//   const [userName, setUserName] = useState<string>("");
//   const [bio, setBio] = useState<string>("");
//   const [profilePicture, setProfilePicture] = useState<string>("");
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [editMode, setEditMode] = useState<boolean>(false);
//   const [newBio, setNewBio] = useState<string>("");
//   const [newProfilePicture, setNewProfilePicture] = useState<string>("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         let userId = localStorage.getItem("user");
//         if (!userId) {
//           navigate("/login");
//           return;
//         }

//         userId = userId.replace(/"/g, "");

//         const userResponse = await getUserById(userId);
//         console.log(userResponse)
//         setUserName(userResponse.data.username);
//         setBio(userResponse.data.bio);
//         setProfilePicture(userResponse.data.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png");

//         const postsResponse = await getPostsByUserId(userId);

//         // Ensure each post has an "images" array
//         const formattedPosts = (postsResponse.data as Post[]).map((post) => ({
//           ...post,
//           images: post.images || [], // Ensure images is always an array
//         }));

//         setPosts(formattedPosts);
//       } catch (error) {
//         console.error("Error fetching user data or posts:", error);
//       }
//     };

//     fetchProfileData();
//   }, [navigate]);

//   const handleEditProfile = async () => {
//     try {
//       let userId = localStorage.getItem("user")?.replace(/"/g, "");
//       if (!userId) return;


//       await updateProfile(userId, newBio || bio, newProfilePicture || profilePicture);
//       setBio(newBio || bio);
//       setProfilePicture(newProfilePicture || profilePicture);
//       setEditMode(false);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };

//   return (
//     <div className="profile-container" style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
//       {/* Profile Section */}
//       <div
//         className="profile-header"
//         style={{
//           textAlign: "center",
//           padding: "20px",
//           borderRadius: "15px",
//           backgroundColor: "#f9f9f9",
//           boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//           marginBottom: "20px",
//         }}
//       >
//         <img
//           src={profilePicture}
//           alt="Profile"
//           className="profile-picture"
//           style={{
//             width: "150px",
//             height: "150px",
//             borderRadius: "50%",
//             objectFit: "cover",
//             border: "3px solid #ff9800",
//             marginBottom: "10px",
//           }}
//         />
//         <h1 style={{ fontWeight: "bold", fontSize: "1.8rem" }}>{userName ? `${userName}'s Profile` : "Loading..."}</h1>
//         <p style={{ fontSize: "1.1rem", fontStyle: "italic", color: "#666" }}>{bio}</p>
//         <Button variant="warning" onClick={() => setEditMode(true)}>Edit Profile</Button>
//       </div>

//       {/* Modal for Editing Profile */}
//       <Modal show={editMode} onHide={() => setEditMode(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Profile</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group>
//               <Form.Label>New Profile Picture URL</Form.Label>
//               <Form.Control type="text" value={newProfilePicture} onChange={(e) => setNewProfilePicture(e.target.value)} />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>New Bio</Form.Label>
//               <Form.Control as="textarea" rows={3} value={newBio} onChange={(e) => setNewBio(e.target.value)} />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
//           <Button variant="warning" onClick={handleEditProfile}>Save Changes</Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Posts Section */}
//       <h2 style={{ textAlign: "center", marginBottom: "15px" }}>My Posts</h2>
//       <div className="posts-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
//         {posts.length > 0 ? posts.map((post) => (
//           <Card key={post._id} style={{
//             padding: "15px",
//             borderRadius: "12px",
//             boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
//             backgroundColor: "#ffffff"
//           }}>
//             <Card.Img
//               variant="top"
//               src={post.images && post.images.length > 0 ? post.images[0] : "https://via.placeholder.com/300"}
//               style={{
//                 borderRadius: "10px",
//                 height: "180px",
//                 objectFit: "cover",
//                 backgroundColor: "#f0f0f0"
//               }}
//             />
//             <Card.Body>
//               <Card.Title style={{ fontWeight: "bold", fontSize: "1.3rem" }}>{post.title}</Card.Title>
//               <Card.Text style={{ color: "#444" }}>{post.content}</Card.Text>
//               <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
//                 <Badge bg="success">{post.likes.length} Likes</Badge>
//                 <Badge bg="info">{post.commentsCount ? post.commentsCount : 0} Comments</Badge>
//                 </div>
//             </Card.Body>
//           </Card>
//         )) : <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#777" }}>No posts found.</p>}
//       </div>
//     </div>
//   );
// };

// export default Profile;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, getPostsByUserId, uploadProfilePicture, updateBio } from "../api";
import { Card, Form, Badge,Dropdown } from "react-bootstrap";
import { FaEllipsisV } from "react-icons/fa";
import { PencilSquare } from "react-bootstrap-icons";
import { deletePost } from "../api";

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  images: string[];
  likes: string[];
  commentsCount: number;
}

const Profile = () => {
  const [userName, setUserName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [newBio, setNewBio] = useState<string>("");
  const navigate = useNavigate();

  
  
  // Handle post edit
  const handleEdit = (postId: string) => {
    localStorage.setItem("selectedPostId", postId); // Save post ID to localStorage
    navigate("/edit-post"); // Navigate to edit page
  };
  
  // Handle post delete
  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId); // Call deletePost API function
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId)); // Update state to remove deleted post
      console.log(`Post ${postId} deleted successfully`);
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
  
      // ✅ Ensure the new image URL updates immediately
      const newProfilePicUrl = `${response.profileImage}`;
      console.log(newProfilePicUrl);

      setProfileImage(newProfilePicUrl); // Update UI instantly
  
      // ✅ Also update localStorage so the change persists
      localStorage.setItem("profilePicture", newProfilePicUrl);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleBioUpdate = async () => {
    try {
      let userId = localStorage.getItem("user")?.replace(/"/g, "");
      if (!userId || !newBio) return;
      console.log(newBio)

      await updateBio(userId, newBio);
      setBio(newBio);
      setIsEditingBio(false);
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  return (
    <div className="profile-container" style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      {/* Profile Section */}
      <div className="profile-header" style={{
        textAlign: "center",
        padding: "20px",
        borderRadius: "15px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px",
        position: "relative",
      }}>
        {/* Profile Picture Container with Circle Fix */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "4px solid #ff9800",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img
              src={`${profileImage}`}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            id="profilePicUpload"
            onChange={handleProfilePictureUpload}
          />
          {/* Pencil Icon for Profile Picture Edit */}
          <label htmlFor="profilePicUpload">
            <PencilSquare
              size={24}
              color="#ff9800"
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                backgroundColor: "#fff",
                borderRadius: "50%",
                padding: "4px",
                cursor: "pointer",
              }}
            />
          </label>
        </div>

        <h1 style={{ fontWeight: "bold", fontSize: "1.8rem" }}>{userName ? `${userName}'s Profile` : "Loading..."}</h1>

        {/* Editable Bio */}
        {isEditingBio ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
            <Form.Control
              type="text"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              style={{ maxWidth: "400px" }}
            />
            <button className="btn btn-warning" onClick={handleBioUpdate}>Save</button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px", cursor: "pointer" }}>
            <p style={{ fontSize: "1.1rem", fontStyle: "italic", color: "#666" }} onClick={() => setIsEditingBio(true)}>
              {bio}
            </p>
            <PencilSquare size={20} color="#ff9800" onClick={() => setIsEditingBio(true)} />
          </div>
        )}
      </div>

      {/* Posts Section */}
      <h2 style={{ textAlign: "center", marginBottom: "15px" }}>My Posts</h2>
      <div className="posts-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {posts.length > 0 ? posts.map((post) => (
          <Card key={post._id} style={{
            padding: "15px",
            borderRadius: "12px",
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#ffffff"
          }}>
            <Card.Img
              variant="top"
              src={post.images.length > 0 ? post.images[0] : "https://via.placeholder.com/300"}
              style={{
                borderRadius: "10px",
                height: "180px",
                objectFit: "cover",
                backgroundColor: "#f0f0f0"
              }}
            />
            <Card.Body>
              
              <Card.Title style={{ fontWeight: "bold", fontSize: "1.3rem" }}>{post.title}</Card.Title>
              <Card.Text style={{ color: "#444" }}>{post.content}</Card.Text>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <Badge bg="success">{post.likes.length} Likes</Badge>
                <Badge bg="info">{post.commentsCount} Comments</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">

              {/* Three Dots Menu (Edit/Delete) Positioned at Top-Right */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  size="sm"
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "0px",
                  }}
                >
                  <FaEllipsisV
                    style={{
                      color: "#FF9800", // Orange color
                      fontSize: "1.5rem", // Bigger size for better visibility
                      cursor: "pointer",
                    }}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ borderRadius: "8px", border: "none", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
                  <Dropdown.Item onClick={() => handleEdit(post._id)} style={{ color: "#FF9800", fontWeight: "bold" }}>
                    ✏️ Edit
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleDelete(post._id)} style={{ color: "red", fontWeight: "bold" }}>
                    🗑️ Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            </Card.Body>
          </Card>
        )) : <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#777" }}>No posts found.</p>}
      </div>
    </div>
  );
};

export default Profile;
