import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Download, Pen, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SignaturePadProps {
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  penWidth?: number;
  onSignatureChange?: (isEmpty: boolean, signatureData?: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  showMetadata?: boolean;
}

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  getSignatureData: () => string | null;
  getSignatureBlob: () => Promise<Blob | null>;
  undo: () => void;
}

interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({
  width = 400,
  height = 200,
  penColor = '#000000',
  backgroundColor = '#ffffff',
  penWidth = 2,
  onSignatureChange,
  className = '',
  disabled = false,
  required = false,
  label = 'Signature',
  description,
  showMetadata = false,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [signatureMetadata, setSignatureMetadata] = useState<any>(null);

  // Collect device and signature metadata
  useEffect(() => {
    const collectDeviceInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString(),
      };
      setDeviceInfo(info);
    };

    collectDeviceInfo();
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    canvas.width = width;
    canvas.height = height;
    
    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Set pen properties
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Smooth line drawing
    ctx.imageSmoothingEnabled = true;
  }, [width, height, backgroundColor, penColor, penWidth]);

  // Redraw all strokes
  const redrawCanvas = (strokesArray: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw all strokes
    strokesArray.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        ctx.lineTo(point.x, point.y);
      }
      
      ctx.stroke();
    });
  };

  // Get coordinates from event
  const getCoordinates = (event: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, timestamp: Date.now() };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
        pressure: (touch as any).force || 0.5,
        timestamp: Date.now(),
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
        pressure: 0.5,
        timestamp: Date.now(),
      };
    }
  };

  // Start drawing
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDrawing(true);
    
    const point = getCoordinates(event.nativeEvent as MouseEvent | TouchEvent);
    setCurrentStroke([point]);
  };

  // Continue drawing
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    
    event.preventDefault();
    
    const point = getCoordinates(event.nativeEvent as MouseEvent | TouchEvent);
    const newStroke = [...currentStroke, point];
    setCurrentStroke(newStroke);
    
    // Draw current line
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (newStroke.length >= 2) {
      const prevPoint = newStroke[newStroke.length - 2];
      const currPoint = newStroke[newStroke.length - 1];
      
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(currPoint.x, currPoint.y);
      ctx.stroke();
    }
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing || disabled) return;
    
    setIsDrawing(false);
    
    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: penColor,
        width: penWidth,
      };
      
      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);
      setCurrentStroke([]);
      
      const newIsEmpty = newStrokes.length === 0;
      setIsEmpty(newIsEmpty);
      
      // Update metadata
      if (!newIsEmpty) {
        const metadata = {
          strokeCount: newStrokes.length,
          totalPoints: newStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0),
          signatureArea: calculateSignatureArea(newStrokes),
          duration: calculateSignatureDuration(newStrokes),
          deviceInfo,
          timestamp: new Date().toISOString(),
        };
        setSignatureMetadata(metadata);
      }
      
      if (onSignatureChange) {
        onSignatureChange(newIsEmpty, newIsEmpty ? undefined : getSignatureDataString());
      }
    }
  };

  // Calculate signature area (bounding box)
  const calculateSignatureArea = (strokesArray: Stroke[]) => {
    if (strokesArray.length === 0) return { width: 0, height: 0 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    strokesArray.forEach(stroke => {
      stroke.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });
    
    return {
      width: maxX - minX,
      height: maxY - minY,
      x: minX,
      y: minY,
    };
  };

  // Calculate signature duration
  const calculateSignatureDuration = (strokesArray: Stroke[]) => {
    if (strokesArray.length === 0) return 0;
    
    let earliestTime = Infinity;
    let latestTime = -Infinity;
    
    strokesArray.forEach(stroke => {
      stroke.points.forEach(point => {
        earliestTime = Math.min(earliestTime, point.timestamp);
        latestTime = Math.max(latestTime, point.timestamp);
      });
    });
    
    return latestTime - earliestTime; // Duration in milliseconds
  };

  // Get signature as base64 string
  const getSignatureDataString = (): string => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return '';
    return canvas.toDataURL('image/png');
  };

  // Get signature as blob
  const getSignatureBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas || isEmpty) {
        resolve(null);
        return;
      }
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  // Clear signature
  const clear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setIsEmpty(true);
    setSignatureMetadata(null);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    if (onSignatureChange) {
      onSignatureChange(true);
    }
  };

  // Undo last stroke
  const undo = () => {
    if (strokes.length === 0) return;
    
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    
    const newIsEmpty = newStrokes.length === 0;
    setIsEmpty(newIsEmpty);
    
    redrawCanvas(newStrokes);
    
    if (onSignatureChange) {
      onSignatureChange(newIsEmpty, newIsEmpty ? undefined : getSignatureDataString());
    }
  };

  // Download signature as image
  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    
    const link = document.createElement('a');
    link.download = `signature_${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clear,
    isEmpty: () => isEmpty,
    getSignatureData: getSignatureDataString,
    getSignatureBlob,
    undo,
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Pen className="h-4 w-4" />
              {label}
              {required && <span className="text-red-500">*</span>}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isEmpty && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                Signed
              </Badge>
            )}
            {required && isEmpty && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Required
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className={`border-2 border-dashed rounded-md p-2 ${
          disabled ? 'bg-gray-50 border-gray-200' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <canvas
            ref={canvasRef}
            className={`block bg-white rounded border ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair'
            }`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ 
              width: '100%', 
              height: `${height}px`,
              maxWidth: `${width}px`,
            }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={disabled || strokes.length === 0}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Undo
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clear}
              disabled={disabled || isEmpty}
              className="flex items-center gap-1"
            >
              Clear
            </Button>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadSignature}
            disabled={isEmpty}
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
        
        {/* Signature validation */}
        {required && isEmpty && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Signature is required to proceed.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Signature metadata (for debugging/admin) */}
        {showMetadata && signatureMetadata && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
            <div className="font-medium mb-2">Signature Metadata:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>Strokes: {signatureMetadata.strokeCount}</div>
              <div>Points: {signatureMetadata.totalPoints}</div>
              <div>Duration: {Math.round(signatureMetadata.duration / 1000)}s</div>
              <div>Area: {Math.round(signatureMetadata.signatureArea?.width || 0)}×{Math.round(signatureMetadata.signatureArea?.height || 0)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;