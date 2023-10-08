'use client'
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FC, useState } from "react";
import axios from "axios";
import UploadIcon from "@/components/UploadIcon";

const UploadForm: FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const upload = async (ev: ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const files = ev.target.files;
    try {
      if (files && files.length > 0) {
        const file = files[0];
        setIsUploading(true);
        const data = new FormData()
        data.set('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: data
        })
        //handle the error
        if (!res.ok) throw new Error(await res.text())

        const responseJson = await res.json();
        setIsUploading(false);
        const { newName } = responseJson;
        router.push('/' + newName);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <>
      {isUploading && (
        <div className="bg-black/90 text-white fixed inset-0 flex items-center">
          <div className="w-full text-center">
            <h2 className="text-4xl mb-4">Uploading</h2>
            <h3 className="text-xl">Please wait...</h3>
          </div>
        </div>
      )}
      <label className="bg-green-600 py-2 px-6 rounded-full inline-flex gap-2 border-2 border-purple-700/50 cursor-pointer">
        <UploadIcon />
        <span>Choose file</span>
        <input onChange={upload} type="file" className="hidden" />
      </label>
    </>
  );
};

export default UploadForm;



// const res = await fetch('/api/upload', {
//   method: 'POST',
//   body: formData,
// });
