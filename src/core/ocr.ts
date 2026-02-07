import { runSwift } from "../utils/swift-runner.js";

/** OCR a PNG file using macOS Vision framework, returns text with positions */
export async function ocrImage(imagePath: string): Promise<string> {
  const code = `
import Vision
import AppKit

let url = URL(fileURLWithPath: "${imagePath}")
guard let image = NSImage(contentsOf: url),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("ERROR: Failed to load image")
    exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["ja", "en"]
request.usesLanguageCorrection = true

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
try handler.perform([request])

guard let results = request.results else { exit(1) }

let sorted = results.sorted { a, b in
    let ay = 1 - a.boundingBox.origin.y - a.boundingBox.height
    let by = 1 - b.boundingBox.origin.y - b.boundingBox.height
    if abs(ay - by) < 0.03 {
        return a.boundingBox.origin.x < b.boundingBox.origin.x
    }
    return ay < by
}

for obs in sorted {
    guard let text = obs.topCandidates(1).first?.string else { continue }
    let box = obs.boundingBox
    let xPct = Int(box.origin.x * 100)
    let yPct = Int((1 - box.origin.y - box.height) * 100)
    print("(\\(xPct),\\(yPct)) \\(text)")
}
`;
  return await runSwift(code);
}
