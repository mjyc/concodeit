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
  }));
  const vlSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: data,
    },
    transform: [
      {
        calculate:
          "(indexof(datum.filename, 'Async') != -1) ? 'async' : (indexof(datum.filename, 'Callback') != -1 ) ? 'callback' : 'waitfor'",
        as: "api",
      },
      {
        calculate: "(indexof(datum.filename, 'WA') != -1) ? 'WA' : 'WO'",
        as: "cctype",
      },
      {
        calculate:
          "(indexof(datum.filename, 'AA') != -1) ? 'AA' : (indexof(datum.filename, 'AE') != -1) ? 'AE' : 'EE'",
        as: "eventtype",
      },
      {
        calculate:
          "(indexof(datum.filename, 'WO-AA') != -1) ? 'WO-AA' : (indexof(datum.filename, 'WO-AE') != -1) ? 'WO-AE' : (indexof(datum.filename, 'WO-EE') != -1) ? 'WO-EE' : (indexof(datum.filename, 'WA-AA') != -1) ? 'WA-AA' : (indexof(datum.filename, 'WA-AE') != -1) ? 'WA-AE' : 'WA-EE'",
        as: "type",
      },
    ],
    mark: { type: "point", filled: true },
    encoding: {
      x: {
        field: "numTotalBlocks",
        type: "quantitative",
        aggregate: "mean",
        scale: { domain: [0, 30] },
        title: null,
      },
      y: { field: "type", type: "nominal", title: null },
      color: { field: "api", legend: { title: null, orient: "right" } },
      shape: { field: "api", legend: { title: null, orient: "right" } },
    },
  };
  vegaEmbed("#vis", vlSpec);
};

fetch("/dist/sysevaldata.json")
  .then((response) => {
    return response.json();
  })
  .then((rawData) => {
    main(rawData);
  });
