const tableau10 = {
  blue: "#1f77b4",
  orange: "#ff7f0e",
  red: "#d62728",
  cyan: "#17becf",
  green: "#2ca02c",
  lime: "#bcbd22",
  purple: "#9467bd",
  magenta: "#e377c2",
  brown: "#8c564b",
  gray: "#7f7f7f",
};

const main = (data) => {
  data = data.map((d) => ({
    filename: d["filename"],
    numTotalBlocks: d["numTotalBlocks"],
    numFunctions: d["numFunctions"],
    numVariables: d["numVariables"],
    numBranches: d["numBranches"],
    numLoops: d["numLoops"],
    numConds: d["numConds"],
  }));
  const vlSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: data,
    },
    mark: {
      type: "point",
    },
    encoding: {
      x: {
        field: "total",
        type: "quantitative",
      },
      y: {
        field: "total",
        type: "quantitative",
      },
    },
  };
  vegaEmbed("#vis", vlSpec);
};

fetch("/dist/userstudyresp.json")
  .then((response) => {
    return response.json();
  })
  .then((rawData) => {
    main(rawData);
  });
