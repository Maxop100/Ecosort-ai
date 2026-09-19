import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Type, Sparkles, X, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, HelpCircle, SwitchCamera, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface ScanUploaderProps {
  onScan: (inputType: 'image' | 'text', inputData: string) => Promise<void>;
  isLoading: boolean;
  municipality: string;
  initialText?: string;
}

const SAMPLE_ITEMS = [
  { label: 'Lithium Phone Battery', type: 'text', text: 'Swollen rechargeable lithium smartphone battery with 3.8V terminals', icon: '🔋', category: 'hazardous' },
  { label: 'Greasy Pizza Box', type: 'text', text: 'Cardboard takeout pizza box with melted cheese and thick cooking grease residues on the bottom', icon: '🍕', category: 'organic' },
  { label: 'Crushed Soda Can', type: 'text', text: 'Empty aluminum 330ml beverage can, completely drained and rinsed', icon: '🥫', category: 'recyclable' },
  { label: 'Broken CFL Tube', type: 'text', text: 'Cracked compact fluorescent bulb containing mercury phosphor powder', icon: '💡', category: 'hazardous' },
  { label: 'Food Scraps & Peels', type: 'text', text: 'Banana peels, apple cores, and damp coffee grounds leftover from breakfast', icon: '🍌', category: 'organic' },
  { label: 'Plastic Bubble Wrap', type: 'text', text: 'Clear polyethylene packaging bubble wrap and shipping plastic pouch', icon: '📦', category: 'general' },
];

export const ScanUploader: React.FC<ScanUploaderProps> = ({ onScan, isLoading, municipality, initialText }) => {
  const [activeMode, setActiveMode] = useState<'image' | 'text'>(initialText ? 'text' : 'image');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState(initialText || '');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (initialText) {
      setTextInput(initialText);
      setActiveMode('text');
    }
  }, [initialText]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  // Stop camera when unmounting or changing modes
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [activeMode]);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  const startCamera = async (overrideFacingMode?: 'environment' | 'user') => {
    setCameraError(null);
    setIsStartingCamera(true);
    const targetFacing = overrideFacingMode || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // If WebRTC getUserMedia is not supported (e.g. strict iframe or older browser), trigger native device camera picker
      setIsStartingCamera(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
        return;
      }
      setCameraError('Camera API is not supported in this browser. Please use the "Upload Photo" option.');
      return;
    }

    try {
      // First try preferred facing mode with ideal resolution
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: targetFacing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (firstErr) {
        console.warn('Initial camera constraints failed, attempting fallback constraints:', firstErr);
        // Fallback: try basic video without strict resolution or facing mode constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (secondErr: any) {
          throw secondErr;
        }
      }

      if (stream) {
        setIsCameraActive(true);
        // Small delay to ensure the video element is mounted in DOM
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.muted = true;
            videoRef.current.play().catch((playErr) => {
              console.error('Video play error:', playErr);
            });
          }
        }, 50);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMsg = 'Unable to access device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Please allow camera permissions in your browser or address bar, or use the "Upload / Take Photo" button.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera device found on this system. You can upload an image file instead.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is in use by another application or tab. Please close other camera apps and retry.';
      } else {
        errorMsg = `Camera error (${err.name || 'Error'}). If you are in an embedded preview, click "Take Photo (Device App)" or open in a new tab.`;
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const toggleFacingMode = () => {
    stopCameraStream();
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedImage(dataUrl);
        stopCameraStream();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setCameraError(null);
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawDataUrl = event.target.result as string;
        // Optimize and resize image for fast transmission and Gemini vision ingestion
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          // Try WebP compression first for superior compression efficiency; fallback to JPEG
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            let optimizedDataUrl = canvas.toDataURL('image/webp', 0.82);
            // Fallback to JPEG if browser does not encode webp dataUrl
            if (!optimizedDataUrl.startsWith('data:image/webp')) {
              optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            }
            setSelectedImage(optimizedDataUrl);
          } else {
            setSelectedImage(rawDataUrl);
          }
          stopCameraStream();
        };
        img.onerror = () => {
          setSelectedImage(rawDataUrl);
          stopCameraStream();
        };
        img.src = rawDataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode === 'image') {
      if (!selectedImage) return;
      await onScan('image', selectedImage);
    } else {
      if (!textInput.trim()) return;
      await onScan('text', textInput.trim());
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_ITEMS[0]) => {
    setActiveMode('text');
    setTextInput(sample.text);
    stopCameraStream();
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm p-6 sm:p-8">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E7E0] pb-4 mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332] font-['Space_Grotesk'] tracking-tight">
            Identify & Segregate Waste
          </h1>
          <p className="text-xs sm:text-sm text-[#52796F] mt-0.5">
            Classify material via multimodal vision AI and match against municipal RAG rules.
          </p>
        </div>
        <div className="flex items-center bg-[#F0F4EF] p-1 rounded-2xl border border-[#E0E7E0] self-start sm:self-auto">
          <button
            id="mode-tab-image"
            type="button"
            onClick={() => {
              setActiveMode('image');
              stopCameraStream();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'image'
                ? 'bg-white text-[#1B4332] shadow-xs'
                : 'text-[#40916C] hover:text-[#1B4332]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Photo / Camera</span>
          </button>
          <button
            id="mode-tab-text"
            type="button"
            onClick={() => {
              setActiveMode('text');
              stopCameraStream();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'text'
                ? 'bg-white text-[#1B4332] shadow-xs'
                : 'text-[#40916C] hover:text-[#1B4332]'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Describe Item</span>
          </button>
        </div>
      </div>

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeMode === 'image' ? (
          <div>
            {isCameraActive ? (
              // Live camera stream view
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border border-[#1B4332] shadow-md">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Floating Top Bar with Facing Mode Indicator & Flip Button */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                    Live Camera ({facingMode === 'environment' ? 'Rear / Back' : 'Front'})
                  </span>
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105 cursor-pointer"
                    title="Flip camera (Front/Back)"
                  >
                    <SwitchCamera className="w-4 h-4 text-[#52B788]" />
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                  <button
                    id="capture-photo-btn"
                    type="button"
                    onClick={capturePhoto}
                    className="w-14 h-14 rounded-full bg-white border-4 border-[#52B788] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    title="Capture Photo"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2D6A4F]" />
                  </button>
                  <button
                    id="cancel-camera-btn"
                    type="button"
                    onClick={stopCameraStream}
                    className="px-4 py-2 rounded-xl bg-[#1B4332]/85 text-white text-xs font-semibold backdrop-blur-sm hover:bg-[#1B4332] cursor-pointer shadow-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedImage ? (
              // Image preview view
              <div className="relative rounded-3xl overflow-hidden border border-[#E0E7E0] bg-[#F7F9F6] max-h-96 flex items-center justify-center group p-2">
                <img
                  src={selectedImage}
                  alt="Scanned waste material pending computer vision and municipal RAG classification"
                  decoding="async"
                  className="max-h-96 w-auto object-contain rounded-2xl"
                />
                <button
                  id="remove-image-btn"
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 bg-[#1B4332]/80 hover:bg-[#1B4332] text-white rounded-full transition-colors shadow-md cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 bg-[#1B4332]/85 text-white text-xs px-3.5 py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Image ready for AI classification</span>
                </div>
              </div>
            ) : (
              // Dropzone & file picker
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(e.dataTransfer.types.includes('Files'));
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-[#2D6A4F] bg-[#D8F3DC]/30'
                    : 'border-[#B7E4C7] bg-[#F7F9F6] hover:bg-[#F0FFF4] hover:border-[#52B788]'
                }`}
              >
                {/* Standard file picker for files/gallery */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Direct native camera input (guaranteed to work even if getUserMedia WebRTC stream is blocked in iframe) */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-3.5 border-2 border-dashed border-[#52B788]">
                  <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-[#2D6A4F]" />
                </div>
                <h3 className="font-bold text-[#1B4332] text-base sm:text-lg font-['Space_Grotesk']">
                  Take Photo or Upload Waste Item
                </h3>
                <p className="text-xs text-[#52796F] mt-1 max-w-sm mx-auto leading-relaxed">
                  Capture directly using your device's camera or choose any image from your gallery.
                </p>

                {/* Camera & Upload Options */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    id="open-webcam-btn"
                    type="button"
                    disabled={isStartingCamera}
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-[1.02] cursor-pointer"
                  >
                    {isStartingCamera ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <span>{isStartingCamera ? 'Opening Camera...' : 'Open Live Camera'}</span>
                  </button>

                  <button
                    id="open-device-camera-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#B7E4C7] hover:bg-[#D8F3DC] text-[#1B4332] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="Trigger device native camera app directly"
                  >
                    <Camera className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Take Photo (Native App)</span>
                  </button>

                  <button
                    id="open-gallery-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#F0F4EF] hover:bg-[#E0E7E0] text-[#52796F] hover:text-[#1B4332] rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Browse Files</span>
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{cameraError}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#2D6A4F] text-white text-[11px] font-bold hover:bg-[#1B4332] transition-colors cursor-pointer"
                      >
                        Use Native Device Camera Instead
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-[#1B4332] text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        Upload Photo from Files
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Text Input Mode
          <div>
            <label className="block text-xs font-bold text-[#1B4332] mb-2">
              Describe the waste item, container, material, or leftover:
            </label>
            <textarea
              id="waste-item-description-input"
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Broken rechargeable lithium power bank with bulging casing, or greasy bottom of a pepperoni pizza cardboard box..."
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E0E7E0] bg-white focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#52B788]/20 text-sm text-[#1B4332] placeholder:text-[#52796F]/60 outline-none transition-all resize-none font-medium"
            />
            <div className="flex items-center justify-between text-xs text-[#52796F] mt-1.5">
              <span>Mention cleanliness, material type, or condition for highest precision.</span>
              <span>{textInput.length} chars</span>
            </div>
          </div>
        )}

        {/* Quick Sample Clickers */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Test Examples:
            </span>
            <span className="text-[11px] text-[#52796F]">Click to autofill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SAMPLE_ITEMS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl text-left border border-[#E0E7E0] bg-white hover:border-[#52B788] hover:bg-[#F0FFF4] text-xs text-[#1B4332] transition-all group cursor-pointer shadow-xs"
              >
                <span className="text-lg">{sample.icon}</span>
                <div className="truncate flex-1">
                  <div className="font-bold text-[#1B4332] truncate group-hover:text-[#2D6A4F]">
                    {sample.label}
                  </div>
                  <div className="text-[10px] text-[#52796F] capitalize font-medium">{sample.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Municipality hint */}
        <div className="bg-[#F0F4EF] border border-[#E0E7E0] rounded-2xl p-3.5 flex items-center justify-between text-xs text-[#52796F]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1B4332]">Selected Municipality:</span>
            <span className="capitalize font-bold text-[#1B4332] bg-[#D8F3DC] px-2.5 py-0.5 rounded-full border border-[#B7E4C7]">
              {municipality.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[#52796F] hidden sm:inline font-medium">RAG rules tailored to local regulations</span>
        </div>

        {/* Action Button */}
        <button
          id="run-scan-btn"
          type="submit"
          disabled={isLoading || (activeMode === 'image' ? !selectedImage : !textInput.trim())}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] disabled:bg-[#E0E7E0] disabled:text-[#52796F]/50 text-white font-bold text-sm transition-all shadow-sm shadow-[#2D6A4F]/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing with Multimodal AI & Querying RAG Rules...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#52B788]" />
              <span>Analyze & Get Municipal Disposal Instructions</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
