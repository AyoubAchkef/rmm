import Silk from '@/components/ui/silk';

export default function Home() {
  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0 w-full h-full">
        <Silk
          speed={5}
          scale={1}
          color="#1C355E"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
    </div>
  );
}
