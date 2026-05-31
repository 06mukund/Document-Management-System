import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  // 🔹 STATES
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [files, setFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState("");

  const [newFolderName, setNewFolderName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH FOLDERS
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/folders",
        {
          headers: { Authorization: token },
        }
      );

      setFolders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // FETCH FILES
  const fetchFiles = async (folderId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/files/folder/${folderId}`,
        {
          headers: { Authorization: token },
        }
      );

      setFiles(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // CREATE FOLDER
  const handleCreateFolder = async () => {
    try {
      if (!newFolderName) {
        alert("Enter folder name");
        return;
      }

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/folders",
        { name: newFolderName },
        {
          headers: { Authorization: token },
        }
      );

      setNewFolderName("");
      fetchFolders();

    } catch (err) {
      console.log(err);
    }
  };

  // UPLOAD FILE
  const handleUpload = async () => {
    try {
      if (!selectedFolder) {
        alert("Select a folder first");
        return;
      }

      if (!selectedFile) {
        alert("Select a file");
        return;
      }

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folderId", selectedFolder._id);
      formData.append("filename", customName);

      await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        {
          headers: { Authorization: token },
        }
      );

      fetchFiles(selectedFolder._id);

    } catch (err) {
      console.log(err);
    }
  };

  // DELETE FILE
  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/files/${fileId}`,
        {
          headers: { Authorization: token },
        }
      );

      fetchFiles(selectedFolder._id);

    } catch (err) {
      console.log(err);
    }
  };

  // PREVIEW FILE
  const handlePreview = async (fileId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/files/preview/${fileId}`,
        {
          headers: { Authorization: token },
        }
      );

      let url = res.data.url;


      if (url.endsWith(".pdf")) {
        const viewer = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
        window.open(viewer, "_blank");
      } else {
        window.open(url, "_blank");
      }

    } catch (err) {
      alert("Preview failed");
    }
  };

  // DOWNLOAD FILE
  const handleDownload = async (fileId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/files/download/${fileId}`,
        {
          headers: { Authorization: token },
        }
      );

      const link = document.createElement("a");
      link.href = res.data.url;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      alert("Download failed");
    }
  };

  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 shadow-lg">

      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Folders</h2>

        {/* Create Folder */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="New folder name"
            className="w-full p-2 rounded text-black mb-2"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />

          <button
            onClick={handleCreateFolder}
            className="w-full bg-blue-500 p-2 rounded"
          >
            Create Folder
          </button>
        </div>

        {/* Folder List */}
        {folders.map((folder) => (
          <div
          key={folder._id}
          onClick={() => {
            setSelectedFolder(folder);
            fetchFiles(folder._id);
          }}
          className={`p-2 mb-2 rounded cursor-pointer transition ${
            selectedFolder?._id === folder._id
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {folder.name}
        </div>
        ))}
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 p-6 bg-gray-100">

        <h2 className="text-2xl font-bold mb-4">
          {selectedFolder ? selectedFolder.name : "Select a folder"}
        </h2>

        {/* Upload */}
        <div className="mb-6 flex gap-3 items-center">

        <input
          type="file"
          className="border p-2 rounded bg-white"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <input
          type="text"
          placeholder="Rename file"
          className="border p-2 rounded w-48"
          onChange={(e) => setCustomName(e.target.value)}
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Upload
        </button>

      </div>

        {/* SEARCH */}
        <div className="mb-6">
        <input
          type="text"
          placeholder=" Search files..."
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>

        {/* FILES */}
        <div className="grid grid-cols-3 gap-4">

          {files.length === 0 ? (
            <p className="text-gray-500">No files in this folder</p>
          ) : (
            (() => {
              const filteredFiles = files.filter((file) =>
                file.filename.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (filteredFiles.length === 0) {
                return <p className="text-gray-500">No matching files</p>;
              }

              return filteredFiles.map((file) => (
                <div
                key={file._id}
                onDoubleClick={() => handlePreview(file._id)}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
              >
                <p className="font-semibold text-gray-800 mb-2">
                 {file.filename}
                </p>

                <div className="flex gap-2 mt-3">

                  <button
                    onClick={() => handlePreview(file._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Open
                  </button>

                  <button
                    onClick={() => handleDownload(file._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => handleDelete(file._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>

                </div>
              </div>
              ));
            })()
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;