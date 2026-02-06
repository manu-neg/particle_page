"use client"
import { ParticleCanvas } from "@/components/Particle/ParticleCanvas";
import ParticlesCanvasV2 from "@/components/ParticlesCanvasV2";

export default function Home() {
  return (
    <main id="root" className="w-screen h-screen p-[10%]">
      Particle canvas
      <ParticlesCanvasV2 />
    </main>
  );
}
