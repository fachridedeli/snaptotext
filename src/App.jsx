import { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import "cropperjs/dist/cropper.css";
import { Cropper } from "react-cropper";

import { CameraIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/solid";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { ArrowUturnRightIcon } from "@heroicons/react/24/solid";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/solid";

const App = () => {
  const [front, setFront] = useState(false);
  const videoRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(
    localStorage.getItem("capturedImage") || ""
  );
  const [ocrText, setOcrText] = useState("");
  const [cropper, setCropper] = useState(null);

  useEffect(() => {
    startStream();
  }, [front]);

  const startStream = () => {
    const constraints = {
      video: {
        facingMode: front ? "user" : "environment",
        width: 640,
        height: 480,
      },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
        // alert("Please allow access to the camera.");
      });
  };

  const capture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    localStorage.setItem("capturedImage", dataUrl);
    setImageSrc(dataUrl);
    // alert("Image captured and stored in localStorage!");
  };

  const performOcr = () => {
    if (!cropper) {
      // alert("No image to crop");
      return;
    }
    const croppedCanvas = cropper.getCroppedCanvas();
    const croppedDataUrl = croppedCanvas.toDataURL("image/png");
    Tesseract.recognize(croppedDataUrl, "eng", {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        setOcrText(text);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const deleteImage = () => {
    localStorage.removeItem("capturedImage");
    setOcrText("");
    setImageSrc("");
    // alert("Image removed from localStorage!");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      localStorage.setItem("capturedImage", dataUrl);
      setImageSrc(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = ocrText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    // alert("Text copied to clipboard!");
  };

  const rotateImage = (degrees) => {
    if (cropper) {
      cropper.rotate(degrees);
    }
  };

  return (
    <main className="flex flex-col items-center w-screen h-screen">
      <div className="w-full md:w-1/2 lg:w-1/2 flex-grow">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        ></video>
      </div>
      <div className="w-full flex justify-around py-4 bg-gray-200">
        <button onClick={() => setFront(!front)}>
          <ArrowPathIcon className="h-10 w-10" />
        </button>
        <button onClick={capture}>
          <CameraIcon aria-hidden="true" className="h-10 w-10" />
        </button>
        <button onClick={deleteImage}>
          <TrashIcon className="h-10 w-10" />
        </button>
      </div>
      <div className="w-full flex justify-center py-4 bg-gray-200">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded"
        >
          Choose Your File
        </label>
      </div>
      {imageSrc && (
        <div className="w-full flex-grow">
          <Cropper
            src={imageSrc}
            style={{ height: 400, width: "100%" }}
            initialAspectRatio={1}
            aspectRatio={null}
            guides={true}
            viewMode={1}
            dragMode="move"
            scalable={true}
            cropBoxMovable={true}
            cropBoxResizable={true}
            onInitialized={(instance) => {
              setCropper(instance);
            }}
          />
          <div className="w-full flex justify-around py-4 bg-gray-200">
            <button onClick={() => rotateImage(-90)}>
              <ArrowUturnLeftIcon className="h-10 w-10" />
            </button>
            <button onClick={performOcr}>
              <PlayCircleIcon className="w-10 h-10" />
            </button>
            <button className="h-15 w-15" onClick={() => rotateImage(90)}>
              <ArrowUturnRightIcon className="h-10 w-10" />
            </button>
          </div>
        </div>
      )}
      <div className="w-full flex-grow bg-white">
        {ocrText && (
          <div className="p-4">
            <div className="flex flex-col space-y-4">
              <textarea
                value={ocrText}
                readOnly
                className="w-full h-40 p-2 border border-gray-300 rounded focus:outline-none"
              ></textarea>
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center py-2 bg-blue-500 text-white rounded"
              >
                <ClipboardDocumentListIcon className="w-6 h-6 mr-2" /> Copy to
                Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
