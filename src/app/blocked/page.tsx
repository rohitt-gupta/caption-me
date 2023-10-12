
export default function Blocked() {
  return (
    <div className="h-screen text-white bg-black/80 flex items-center justify-center z-20 ">
      <main>
        <h3>Access blocked.</h3>
        <h4>Max API calls exceeded(2).</h4>
        <h4>Please try again after 7 days</h4>
      </main>
    </div>
  );
}