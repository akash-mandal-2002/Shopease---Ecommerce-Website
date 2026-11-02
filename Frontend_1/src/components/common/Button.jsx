export default function Button({ children, variant = 'primary', className = '', loading = false, ...props }) {
  const styles = { primary: 'bg-gray-950 text-white hover:bg-gray-800', secondary: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50', ghost: 'bg-transparent text-gray-700 hover:bg-gray-100', danger: 'bg-red-600 text-white hover:bg-red-700' };
  return <button disabled={loading || props.disabled} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}{children}</button>;
}
