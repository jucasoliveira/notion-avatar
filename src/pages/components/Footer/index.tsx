export default function Footer() {
  return (
    <footer className="flex flex-col items-center pb-4">
      <div className="flex justify-center mt-10 text-gray-500">
        Created by{' '}
        <a
          className="transition hover:underline ml-1"
          href="https://x.com/lgrodev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Lucas
        </a>
      </div>
    </footer>
  );
}
