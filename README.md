This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ToastContainer />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; -->

<!--
// Ví dụ sử dụng GET trong component:
 import { get } from "@/utils/axios"; // import phương thức get
const Dashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get("/dashboard"); // Gọi API get
        setData(response); // Set dữ liệu từ API vào state
      } catch (error) {
        // Xử lý lỗi nếu có
        console.error(error);
      }
    };
    fetchData();
  }, []);
  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
export default Dashboard;-->

<!-- // Ví dụ sử dụng POST trong component:
import { post } from "@/utils/axios"; // import phương thức post
const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPost = { title, content };
      const response = await post("/posts", newPost); // Gọi API post
     } catch (error) {
      console.error("Failed to create post", error);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Post content"
      />
      <button type="submit">Create Post</button>
    </form>
  );
};
export default CreatePost; -->

<!-- Ví dụ sử dụng phương thức PUT trong component:
// src/components/UpdateProfile.tsx
import React, { useState } from "react";
import { put } from "@/utils/axios"; // Import phương thức put

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUserData = { name, email };

    try {
      const response = await put("/users/update", updatedUserData); // Gọi API PUT
      console.log("User updated:", response);
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default UpdateProfile; -->

<!-- Ví dụ sử dụng phương thức DELETE trong component:
// src/components/DeletePost.tsx
import React, { useState } from "react";
import { del } from "@/utils/axios"; // Import phương thức delete

const DeletePost = ({ postId }: { postId: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await del(`/posts/${postId}`); // Gọi API DELETE
      console.log("Post deleted:", response);
    } catch (error) {
      console.error("Failed to delete post", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Deleting..." : "Delete Post"}
      </button>
    </div>
  );
};

export default DeletePost; -->
