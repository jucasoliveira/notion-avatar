import Image from 'next/image';
import Decoration from './decoration';

export default function Header() {
  return (
    <header className="relative bg-gradient-to-r from-casino-black via-casino-dark-red to-casino-black border-b-4 border-casino-gold">
      <div className="flex py-5 px-5 sm:px-16 md:px-32 items-center">
        <div className="bg-casino-gold p-2 rounded-lg shadow-lg mr-4">
          <Image
            src="/logo.gif"
            alt="Slop AI Avatar Logo"
            width={50}
            height={50}
          />
        </div>
        <span className="text-2xl font-extrabold text-casino-gold tracking-wide">
          SLOP AI
          <br />
          <span className="text-lg text-casino-light-gold">Avatar</span>
        </span>
      </div>
      <Decoration className="absolute top-0 right-0 w-24 sm:w-28 md:w-36 opacity-50" />
    </header>
  );
}
