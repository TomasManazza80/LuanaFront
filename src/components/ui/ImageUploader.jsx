import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "./button";

const ImageUploader = ({ onUploadSuccess, buttonText = "Subir Imagen", multiple = false }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const fileInputRef = useRef(null);
    const reduxToken = useSelector((state) => state.authSlice?.accessToken);

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Upload sequentially or in parallel depending on the requirements.
            // Here we upload them one by one to the backend.
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Client side validation (optional)
                if (file.size > 20 * 1024 * 1024) {
                    throw new Error(`El archivo ${file.name} excede el límite de 20MB.`);
                }

                const formData = new FormData();
                formData.append("image", file);

            // Prioritize reduxToken, as localStorage might have stale tokens from other localhost apps
            const token = reduxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
                const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:10000"}/api/upload`, {
                    method: "POST",
                    headers: {
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Error al subir la imagen.");
                }

                if (onUploadSuccess) {
                    // Passed an object with url and fileId to allow deletion
                    onUploadSuccess({ url: data.url, fileId: data.fileId });
                }
            }
            setSuccessMessage(multiple ? "Imágenes cargadas correctamente." : "Imagen cargada correctamente.");
            setTimeout(() => setSuccessMessage(null), 3000); // Ocultar después de 3 segundos
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // reset input
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple={multiple}
                className="hidden"
            />
            
            <Button
                type="button"
                variant="outline"
                className="w-full flex justify-center items-center gap-2 border-dashed border-2 py-6"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Subiendo...</span>
                    </>
                ) : (
                    <>
                        <UploadCloud className="h-5 w-5" />
                        <span>{buttonText}</span>
                    </>
                )}
            </Button>
            
            {error && (
                <div className="text-red-500 text-sm flex items-center gap-1">
                    <X className="h-4 w-4" /> {error}
                </div>
            )}
            
            {successMessage && (
                <div className="text-green-500 text-sm flex items-center gap-1 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
