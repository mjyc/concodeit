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
  console.log(data);
  const vlSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: data,
    },
    transform: [
      {
        calculate:
          "(substring(datum.id, 0, 1) == 'a') ? 'async' : (substring(datum.id, 0, 1) == 'c' ) ? 'callback' : 'waitfor'",
        as: "api",
      },
    ],
    layer: [
      {
        mark: { type: "point" },
        encoding: {
          x: {
            field: "numTotalBlocks",
            type: "quantitative",
            axis: { title: "Number of Blocks" },
          },
          y: {
            field: "total",
            type: "quantitative",
            axis: { title: "Score" },
          },
          color: {
            field: "api",
            legend: { title: null }, //, orient: "none", legendX: 145, legendY: 20 },
          },
          shape: {
            field: "api",
            legend: { title: null }, //, orient: "none", legendX: 145, legendY: 20 },
          },
        },
      },
      {
        transform: [
          {
            filter: "(substring(datum.id, 0, 1) == 'a')",
          },
        ],
        mark: { type: "rule", color: tableau10.blue },
        encoding: {
          x: {
            aggregate: "average",
            field: "numTotalBlocks",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "(substring(datum.id, 0, 1) == 'c')",
          },
        ],
        mark: { type: "rule", color: tableau10.orange },
        encoding: {
          x: {
            aggregate: "average",
            field: "numTotalBlocks",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "(substring(datum.id, 0, 1) == 'w')",
          },
        ],
        mark: { type: "rule", color: tableau10.red },
        encoding: {
          x: {
            aggregate: "average",
            field: "numTotalBlocks",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "(substring(datum.id, 0, 1) == 'a')",
          },
        ],
        mark: { type: "rule", color: tableau10.blue },
        encoding: {
          y: {
            aggregate: "average",
            field: "total",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "(substring(datum.id, 0, 1) == 'c')",
          },
        ],
        mark: { type: "rule", color: tableau10.orange },
        encoding: {
          y: {
            aggregate: "average",
            field: "total",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "(substring(datum.id, 0, 1) == 'w')",
          },
        ],
        mark: { type: "rule", color: tableau10.red },
        encoding: {
          y: {
            aggregate: "average",
            field: "total",
            type: "quantitative",
          },
        },
      },
    ],
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
