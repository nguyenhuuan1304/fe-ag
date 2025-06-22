import { useState } from "react";
import { Button } from "../components/ui/button";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://localhost:3001/transactions/upload-ipcas",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setStatus(`Success: Imported ${data.count} rows`);
    } catch (error) {
      console.error(error);
      setStatus("Upload failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded space-y-4">
      <h2 className="text-lg font-semibold">Upload IPCAS Excel</h2>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />
      <Button onClick={handleUpload}>Upload</Button>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
}
