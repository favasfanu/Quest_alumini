import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            Managed by{' '}
            <Link
              href="https://questfoundation.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006400] hover:text-[#005200] font-medium hover:underline transition-colors"
            >
              Quest Foundation
            </Link>
          </p>
          <p>
            Developed by{' '}
            <Link
              href="https://favqx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A5CAA] hover:text-[#084A88] font-medium hover:underline transition-colors"
            >
              favqx
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
