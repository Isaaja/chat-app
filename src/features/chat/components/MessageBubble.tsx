"use client";
import { useState } from "react";
import ImageModal from "./ImageModal";
import DefaultAvatar from "../common/DefaultAvatar";
import Image from "next/image";
import { Download } from "lucide-react";
import { Comment, ChatComment } from "../types";

type MessageBubbleProps = {
  comment: Comment | ChatComment;
  myId?: string;
  hideSenderInfo?: boolean;
};

export default function MessageBubble({
  comment,
  myId,
  hideSenderInfo,
}: MessageBubbleProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isMine =
    comment.sender.id === myId ||
    comment.sender.id === "me" ||
    comment.sender.name === "Me";
  const position = isMine ? "chat-end" : "chat-start";

  const hasUploads = comment.uploads && comment.uploads.length > 0;

  const detectFileType = (url: string): "IMAGE" | "VIDEO" | "DOCUMENT" => {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "IMAGE";
    if (["mp4", "webm", "mov", "avi"].includes(ext)) return "VIDEO";
    return "DOCUMENT";
  };

  const getDocumentInfo = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase() || "";

    switch (ext) {
      case "pdf":
        return { icon: "📄", color: "bg-red-100 text-red-600", name: "PDF" };
      case "doc":
      case "docx":
        return { icon: "📝", color: "bg-blue-100 text-blue-600", name: "Word" };
      case "xls":
      case "xlsx":
        return {
          icon: "📊",
          color: "bg-green-100 text-green-600",
          name: "Excel",
        };
      case "ppt":
      case "pptx":
        return {
          icon: "📈",
          color: "bg-orange-100 text-orange-600",
          name: "PowerPoint",
        };
      case "txt":
        return { icon: "📋", color: "bg-gray-100 text-gray-600", name: "Text" };
      case "zip":
      case "rar":
      case "7z":
        return {
          icon: "🗜️",
          color: "bg-purple-100 text-purple-600",
          name: "Archive",
        };
      default:
        return { icon: "📎", color: "bg-gray-100 text-gray-600", name: "File" };
    }
  };

  console.log(comment.sender);
  return (
    <div className={`chat ${position} max-w-full`}>
      {!isMine && !hideSenderInfo && (
        <div className="chat-image">
          <DefaultAvatar name={comment.sender.name} />
        </div>
      )}

      {!isMine && !hideSenderInfo && (
        <div className="chat-header">
          <span className="text-xs opacity-70">{comment.sender.name}</span>
        </div>
      )}

      <div
        className={`chat-bubble break-words ${
          hasUploads ? "max-w-sm md:max-w-md p-2" : "max-w-xs md:max-w-md p-2"
        } ${isMine ? "bg-primary text-primary-content" : ""} ${
          comment.status === "pending"
            ? "opacity-70"
            : comment.status === "failed"
            ? "border border-red-500 bg-red-100"
            : ""
        }`}
      >
        {/* Render uploads */}
        {hasUploads ? (
          <div className="space-y-2 relative">
            {comment.uploads!.map((url: string, idx: number) => {
              const type = detectFileType(url);
              return (
                <div key={idx}>
                  {/* IMAGE */}
                  {type === "IMAGE" && (
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer mx-auto">
                      <Image
                        src={url}
                        alt={comment.message || `image-${idx}`}
                        width={600} // bisa disesuaikan
                        height={400} // bisa disesuaikan
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "auto",
                        }}
                        className="hover:opacity-90 transition-opacity rounded-lg"
                        onClick={() => setIsImageModalOpen(true)}
                        crossOrigin="anonymous"
                        onError={() =>
                          console.error("❌ Image failed to load:", url)
                        }
                        onLoad={() => console.log("✅ Image loaded:", url)}
                        placeholder="empty"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full p-2">
                          🔍
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIDEO */}
                  {type === "VIDEO" && (
                    <div className="rounded-lg overflow-hidden bg-gray-100 relative">
                      <video
                        src={url}
                        className="w-56 rounded-lg"
                        controls
                        preload="metadata"
                        onError={() => {
                          console.error("❌ Video failed to load:", url);
                        }}
                        onLoadedMetadata={() =>
                          console.log("✅ Video loaded:", url)
                        }
                      >
                        <source src={url} type="video/mp4" />
                        <source src={url} type="video/webm" />
                        <source src={url} type="video/mov" />
                        Your browser does not support video playback.
                      </video>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        VIDEO
                      </div>
                    </div>
                  )}

                  {/* DOCUMENT */}
                  {type === "DOCUMENT" && (
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center gap-4">
                        {/* File Icon */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              getDocumentInfo(url).color
                            } group-hover:scale-105 transition-transform`}
                          >
                            <span className="text-2xl">
                              {getDocumentInfo(url).icon}
                            </span>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                getDocumentInfo(url).color
                              }`}
                            >
                              {getDocumentInfo(url).name}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex gap-2">
                          {/* Preview Button (for some file types) */}
                          {["pdf"].includes(
                            url.split(".").pop()?.toLowerCase() || ""
                          ) && (
                            <button
                              onClick={() => window.open(url, "_blank")}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors group-hover:bg-gray-100"
                              title="Preview document"
                            >
                              👁️
                            </button>
                          )}

                          {/* Download Button */}
                          <a
                            href={url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                            title="Download file"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {/* Progress Bar for Visual Appeal */}
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div
                          className={`h-1 rounded-full ${getDocumentInfo(url)
                            .color.replace("100", "500")
                            .replace("text-", "bg-")} w-full`}
                        ></div>
                      </div>
                    </div>
                  )}

                  <ImageModal
                    src={url}
                    alt=""
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                  />
                </div>
              );
            })}
            {/* File caption with filename and size */}
            <div className="text-sm opacity-90 mt-1">
              {"filename" in comment && comment.filename ? (
                <>{comment.filename}</>
              ) : comment.message && comment.message.trim() ? (
                comment.message
              ) : null}
            </div>
          </div>
        ) : (
          /* Render text only */
          (comment.comment || comment.message) && (
            <div>{comment.comment || comment.message}</div>
          )
        )}
      </div>

      {/* Timestamp & status */}
      {comment.timestamp && (
        <div className="chat-footer text-[10px] opacity-70">
          {new Date(comment.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {comment.status && (
            <span className="text-xs ml-1">
              {comment.status === "pending" && "⏳"}
              {comment.status === "failed" && "❌"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
