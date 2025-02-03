export function Stats() {
  return (
    <section className="bg-[#B11E43] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white bg-opacity-10 p-8 rounded-xl">
            <h3 className="text-5xl font-bold mb-2">12</h3>
            <p className="text-xl">Premium Properties</p>
          </div>
          <div className="bg-white bg-opacity-10 p-8 rounded-xl">
            <h3 className="text-5xl font-bold mb-2">2</h3>
            <p className="text-xl">Property Types</p>
          </div>
          <div className="bg-white bg-opacity-10 p-8 rounded-xl">
            <h3 className="text-5xl font-bold mb-2">1</h3>
            <p className="text-xl">City (Mumbai)</p>
          </div>
        </div>
      </div>
    </section>
  )
}

