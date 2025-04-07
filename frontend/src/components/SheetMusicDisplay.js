import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';
import html2canvas from 'html2canvas';
import './SheetMusicDisplay.css';

const SheetMusicDisplay = ({ notation }) => {
  const audioSynthControlRef = useRef(null);
  const synthControlRef = useRef(null);
  const synthRef = useRef(null);
  const [midiBlob, setMidiBlob] = useState(null);

  useEffect(() => {
  if (!notation) return;

  // Render sheet music and get visualObj once
  const visualObj = abcjs.renderAbc("sheet-music", notation, { scale: 0.5 })[0];

  // Init Synth Controller
  const synthControl = new abcjs.synth.SynthController();
  synthControlRef.current = synthControl;

  synthControl.load("#audio-controls", null, {
    displayLoop: true,
    displayRestart: true,
    displayPlay: true,
    displayProgress: true,
    displayWarp: true,
  });

  // Create synth + init
  const synth = new abcjs.synth.CreateSynth();
  synthRef.current = synth;

  synth
    .init({ visualObj })
    .then(() => synthControl.setTune(visualObj, false))
    .catch((err) => console.error("Synth init failed:", err));

    const midiArray = abcjs.synth.getMidiFile(notation, {
    midiOutputType: "binary"
  }); // this gives you a Uint8Array

  const blob = new Blob([midiArray], { type: 'audio/midi' });
  setMidiBlob(blob);
  }, [notation]);

  const downloadMIDI = () => {
    if (!midiBlob) return;

    const url = URL.createObjectURL(midiBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sheet_music.mid";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSheetMusic = () => {
    const element = document.createElement("a");
    const file = new Blob([notation], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "sheet_music.abc";
    document.body.appendChild(element);
    element.click();
  };

  const downloadAsImage = () => {
  const svgElement = document.querySelector("#sheet-music svg");
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");

    // Draw white background first
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image (sheet music) over it
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "sheet_music.png";
    link.click();
  };
  img.src = url;
};


  const downloadAsPDF = () => {
  const svgElement = document.querySelector("#sheet-music svg");
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0);

    const imgData = canvas.toDataURL("image/png");

    // PDF setup
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4", // Standard A4 size
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Maintain aspect ratio
    const imgAspect = canvas.width / canvas.height;
    const pageAspect = pageWidth / pageHeight;

    let renderWidth = pageWidth;
    let renderHeight = pageHeight;

    if (imgAspect > pageAspect) {
      // Image is wider relative to height
      renderHeight = pageWidth / imgAspect;
    } else {
      // Image is taller relative to width
      renderWidth = pageHeight * imgAspect;
    }

    const xOffset = (pageWidth - renderWidth) / 2;
    const yOffset = (pageHeight - renderHeight) / 2;

    pdf.addImage(imgData, "PNG", xOffset, yOffset, renderWidth, renderHeight);
    pdf.save("sheet_music.pdf");

    URL.revokeObjectURL(url);
  };
  img.src = url;
};


  return (

    <div className="sheet-wrapper">
      <div className="sheet-label">Sheet Music</div>
      <div className="sheet-page">
        <div id="sheet-music" ></div>
      </div>
       <div id="audio-controls" className="audio-controls"></div>
      <div className="button-container">
        <button className="download-button" onClick={downloadSheetMusic}>
          Download ABC <br /> Notation
        </button>
        <button className="download-button" onClick={downloadAsImage}>
          Download <br /> Sheet Music <br /> Image
        </button>
        <button className="download-button" onClick={downloadAsPDF}>
          Download <br /> Sheet Music <br /> PDF
        </button>
        <button className="download-button" onClick={downloadMIDI}>
          Download <br /> MIDI
        </button>
      </div>
    </div>

  );
};

export default SheetMusicDisplay;
