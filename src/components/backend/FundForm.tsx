// "use client";

// import { useState } from "react";
// import { THEME } from "@/lib/theme";

// interface Fund {
//   id?: string;
//   plan: string;
//   package: number;
//   perday?: number;
//   quarter?: number;
//   imageId?: string;
//   image?: { url: string };
// }

// export default function FundForm({
//   editing,
//   onClose,
//   onSuccess,
// }: {
//   editing?: Fund | null;
//   onClose: () => void;
//   onSuccess: () => void;
// }) {
//   const [form, setForm] = useState<Fund>(
//     editing || { plan: "", package: 0, perday: undefined, quarter: undefined }
//   );
//   const [preview, setPreview] = useState<string | null>(editing?.image?.url || null);
//   const [uploading, setUploading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: name === "plan" ? value : Number(value) }));
//   };

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploading(true);

//     const fd = new FormData();
//     fd.append("file", file);

//     const res = await fetch("/api/images/upload", {
//       method: "POST",
//       body: fd,
//       credentials: "include",
//     });
//     const data = await res.json();
//     if (data.ok) {
//       setForm((p) => ({ ...p, imageId: data.image.id }));
//       setPreview(data.image.url);
//     }
//     setUploading(false);
//   };

//   const handleSubmit = async () => {
//     const url = editing ? "/api/funds/update" : "/api/funds/create";
//     const method = editing ? "PUT" : "POST";

//     const res = await fetch(url, {
//       method,
//       credentials: "include",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });
//     const data = await res.json();
//     if (data.ok) onSuccess();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//       <div
//         className="p-6 rounded-2xl w-full max-w-md"
//         style={{ background: THEME.card, color: THEME.text }}
//       >
//         <h2 className="text-xl font-bold mb-4 text-bnb-gold">
//           {editing ? "Edit Fund" : "Add New Fund"}
//         </h2>

//         <div className="space-y-3">
//           <input
//             type="text"
//             name="plan"
//             placeholder="Plan name"
//             value={form.plan}
//             onChange={handleChange}
//             className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
//           />
//           <input
//             type="number"
//             name="package"
//             placeholder="Package ($)"
//             value={form.package}
//             onChange={handleChange}
//             className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
//           />
//           <input
//             type="number"
//             name="perday"
//             placeholder="Per day (%)"
//             value={form.perday || ""}
//             onChange={handleChange}
//             className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
//           />
//           <input
//             type="number"
//             name="quarter"
//             placeholder="Quarter (days)"
//             value={form.quarter || ""}
//             onChange={handleChange}
//             className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
//           />

//           <div>
//             <label className="block text-sm mb-1 text-gray-400">Image</label>
//             <input type="file" accept="image/*" onChange={handleUpload} />
//             {uploading && <div className="text-yellow-400 text-sm mt-1">Uploading...</div>}
//             {preview && (
//               <img
//                 src={preview}
//                 alt="preview"
//                 width={200}
//                 className="rounded-xl mt-2 border border-gray-700"
//               />
//             )}
//           </div>
//         </div>

//         <div className="flex justify-end mt-6 gap-3">
//           <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:opacity-80">
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-4 py-2 bg-bnb-yellow text-black rounded-lg hover:opacity-80"
//           >
//             {editing ? "Update" : "Create"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { THEME } from "@/lib/theme";

interface Fund {
  id?: string;
  plan: string;
  package: number;
  perday?: number;
  quarter?: number;
  imageId?: string;
  image?: { url: string };
}

export default function FundForm({
  editing,
  onClose,
  onSuccess,
}: {
  editing?: Fund | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<Fund>(
    editing || { plan: "", package: 0, perday: undefined, quarter: undefined }
  );
  const [preview, setPreview] = useState<string | null>(editing?.image?.url || null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "plan" ? value : Number(value) }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/images/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const data = await res.json();
    if (data.ok) {
      setForm((p) => ({ ...p, imageId: data.image.id }));
      setPreview(data.image.url);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    const url = editing ? "/api/funds/update" : "/api/funds/create";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className="p-6 rounded-2xl w-full max-w-md"
        style={{ background: THEME.card, color: THEME.text }}
      >
        <h2 className="text-xl font-bold mb-4 text-bnb-gold">
          {editing ? "Edit Fund" : "Add New Fund"}
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            name="plan"
            placeholder="Plan name"
            value={form.plan}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
          />
          <input
            type="number"
            name="package"
            placeholder="Package ($)"
            value={form.package || ""}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
          />
          <input
            type="number"
            name="perday"
            placeholder="Per day (%)"
            value={form.perday || ""}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
          />
          <input
            type="number"
            name="quarter"
            placeholder="Quarter (days)"
            value={form.quarter || ""}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-[#1E2329] border border-gray-600"
          />

          <div>
            <label className="block text-sm mb-1 text-gray-400">Image</label>
            <input type="file" accept="image/*" onChange={handleUpload} />
            {uploading && <div className="text-yellow-400 text-sm mt-1">Uploading...</div>}
            {preview && (
              <img
                src={preview}
                alt="preview"
                width={200}
                className="rounded-xl mt-2 border border-gray-700"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:opacity-80">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-bnb-yellow text-black rounded-lg hover:opacity-80"
          >
            {editing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
