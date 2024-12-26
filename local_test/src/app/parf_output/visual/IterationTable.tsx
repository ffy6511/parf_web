"use client";

import React from "react";
import CharPoi from "./CharPoi";
import CharBer from "./CharBer";
import CharBerVec from "./CharBerVec";
import { useIterationData } from "./useIterationData";

const IterationTable = () => {
  const [iterationData, currentIteration] = useIterationData();

  const categorizedParams = iterationData.length > 0
    ? Object.keys(iterationData[0] || {}).reduce(
        (acc, paramKey) => {
          const paramType = iterationData[0][paramKey].type;
          if (!acc[paramType]) acc[paramType] = [];
          acc[paramType].push(paramKey);
          return acc;
        },
        {} as Record<string, string[]>
      )
    : { Char_Poi: [], Char_Ber: [], Char_BerVec: [] };

  return iterationData.length > 0 ? (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Poisson Distribution */}
      <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-bold text-center mb-4">Poisson-Distributed Parameters</h2>
        <div className="grid grid-cols-2 gap-4">
          {categorizedParams.Char_Poi.map((paramKey) => (
            <div key={paramKey} className="h-48 p-2 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-center mb-2">{paramKey}</h3>
              <CharPoi
                allValues={iterationData.map(
                  (iteration) => iteration[paramKey].values as {
                    min: number;
                    max: number;
                    lambda: number;
                  }
                )}
                currentIteration={currentIteration}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bernoulli & Joint Bernoulli */}
      <div className="bg-white shadow-md rounded-lg flex flex-col gap-4 p-4">
        {/* Bernoulli */}
        <div className="flex-1 bg-gray-50 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-center mb-4">Bernoulli-Distributed Parameters</h2>
          <div className="grid grid-cols-2 gap-4">
            {categorizedParams.Char_Ber.map((paramKey) => (
              <div key={paramKey} className="h-40 p-2 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-center mb-2">{paramKey}</h3>
                <CharBer
                  allValues={iterationData.map(
                    (iteration) => [
                      iteration[paramKey].values as number,
                      1 - (iteration[paramKey].values as number),
                    ]
                  )}
                  currentIteration={currentIteration}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Joint Bernoulli */}
        <div className="flex-1 bg-gray-50 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-center mb-4">Joint Distributed Parameters</h2>
          <div>
            {categorizedParams.Char_BerVec.map((paramKey) => (
              <div key={paramKey} className="h-40 p-2 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-center mb-2">{paramKey}</h3>
                <CharBerVec
                  allValues={iterationData.map(
                    (iteration) => iteration[paramKey].values as number[]
                  )}
                  currentIteration={currentIteration}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center text-xl" style ={{marginTop:'20vh'}}>加载中，请稍候...</div>
  );
};

export default IterationTable;
