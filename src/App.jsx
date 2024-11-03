import { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import "cropperjs/dist/cropper.css";
import { Cropper } from "react-cropper";

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
    setImageSrc("");
    setOcrText("");
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
    <div>
      <video ref={videoRef} autoPlay playsInline></video>
      <br />
      <button onClick={() => setFront(!front)}>Flip</button>
      <button onClick={capture}>Capture</button>
      <button onClick={deleteImage}>Delete</button>
      <br />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      {imageSrc && (
        <div>
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
          <br />
          <button onClick={performOcr}>Perform OCR</button>
          <button onClick={() => rotateImage(90)}>Rotate 90°</button>
          <button onClick={() => rotateImage(-90)}>Rotate -90°</button>
        </div>
      )}
      <br />
      {ocrText && (
        <div>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {ocrText}
          </pre>
          <button onClick={copyToClipboard}>Copy to Clipboard</button>
        </div>
      )}
    </div>
  );
};

export default App;
