"use client";

import { useMemo } from "react";
import {
  FileIcon,
  DownloadIcon,
  ImageIcon,
  VideoIcon,
  MusicIcon,
  FileTextIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface BinaryFilePreviewProps {
  filename: string;
  url: string | null | undefined;
}

type FileType = "image" | "video" | "audio" | "pdf" | "unknown";

const IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "ico",
  "bmp",
];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "avi", "mkv"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
const PDF_EXTENSIONS = ["pdf"];

const FILE_TYPE_ICONS: Record<FileType, LucideIcon> = {
  image: ImageIcon,
  video: VideoIcon,
  audio: MusicIcon,
  pdf: FileTextIcon,
  unknown: FileIcon,
};

function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  if (PDF_EXTENSIONS.includes(ext)) return "pdf";
  return "unknown";
}

export function BinaryFilePreview({ filename, url }: BinaryFilePreviewProps) {
  const fileType = useMemo(() => getFileType(filename), [filename]);
  const TypeIcon = FILE_TYPE_ICONS[fileType];

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center size-full bg-muted/20">
        <Spinner className="size-8 text-muted-foreground" />
        <span className="mt-3 text-sm text-muted-foreground">
          Loading preview...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center size-full bg-muted/20 p-6 overflow-auto">
      {fileType === "image" && (
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={filename}
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-md"
          />
        </div>
      )}

      {fileType === "video" && (
        <video
          src={url}
          controls
          className="max-w-full max-h-[calc(100vh-200px)] rounded-lg shadow-md"
        >
          Your browser does not support the video tag.
        </video>
      )}

      {fileType === "audio" && (
        <div className="flex flex-col items-center gap-6 p-8 bg-card rounded-xl shadow-sm border border-border">
          <div className="size-24 rounded-full bg-muted/50 flex items-center justify-center">
            <MusicIcon className="size-12 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {filename}
          </span>
          <audio src={url} controls className="w-full max-w-md">
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}

      {fileType === "pdf" && (
        <iframe
          src={url}
          className="w-full h-full min-h-125 rounded-lg border border-border"
          title={filename}
        />
      )}

      {fileType === "unknown" && (
        <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl shadow-sm border border-border">
          <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center">
            <TypeIcon className="size-10 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {filename}
          </span>
          <span className="text-xs text-muted-foreground">
            Preview not available for this file type
          </span>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <a
              href={url}
              download={filename}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="size-4" />
              Download File
            </a>
          </Button>
        </div>
      )}

      {/* Download button for all supported types */}
      {fileType !== "unknown" && (
        <div className="mt-4">
          <Button asChild variant="ghost" size="sm">
            <a
              href={url}
              download={filename}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <DownloadIcon className="size-4" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
