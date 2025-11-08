import React from 'react'

export default function Debug(){
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold">Diagnostics</h1>
      <div className="mt-4 space-y-3">
        <div className="p-4 bg-white rounded shadow">
          <strong>Backend ping:</strong>
          <div id="ping">Not checked</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <strong>Last calendar sync:</strong>
          <div id="last-sync">Unknown</div>
        </div>
      </div>
    </div>
  )
}
