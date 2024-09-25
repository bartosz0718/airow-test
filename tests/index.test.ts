import { SportsDataProcessor } from "../src/index";
import { SummaryData, SampleData, LapData, ProcessedData } from "../src/types";

describe("SportsDataProcessor", () => {
  let processor: SportsDataProcessor;
  const summaryData: SummaryData = {
    userId: "1234567890",
    activityId: 9480958402,
    activityName: "Indoor Cycling",
    durationInSeconds: 3667,
    startTimeInSeconds: 1661158927,
    startTimeOffsetInSeconds: 7200,
    activityType: "INDOOR_CYCLING",
    averageHeartRateInBeatsPerMinute: 150,
    activeKilocalories: 561,
    deviceName: "instinct2",
    maxHeartRateInBeatsPerMinute: 190,
  };

  const samplesData: SampleData[] = [
    {
      "recording-rate": 5,
      "sample-type": "0",
      data: "86,87,88,88,88,90,91",
    },
    {
      "recording-rate": 5,
      "sample-type": "2",
      data: "120,126,122,140,142,155,145",
    },
    {
      "recording-rate": 5,
      "sample-type": "2",
      data: "141,147,155,160,180,152,120",
    },
    {
      "recording-rate": 5,
      "sample-type": "0",
      data: "86,87,88,88,88,90,91",
    },
    {
      "recording-rate": 5,
      "sample-type": "1",
      data: "143,87,88,88,88,90,91",
    },
    {
      "recording-rate": 5,
      "sample-type": "2",
      data: "143,151,164,null,173,181,180",
    },
    {
      "recording-rate": 5,
      "sample-type": "2",
      data: "182,170,188,181,174,172,158",
    },
    {
      "recording-rate": 5,
      "sample-type": "3",
      data: "143,87,88,88,88,90,91",
    },
  ];

  const lapsData: LapData[] = [
    {
      startTimeInSeconds: 1661158927,
      airTemperatureCelsius: 28,
      heartRate: 109,
      totalDistanceInMeters: 15,
      timerDurationInSeconds: 600,
    },
    {
      startTimeInSeconds: 1661158929,
      airTemperatureCelsius: 28,
      heartRate: 107,
      totalDistanceInMeters: 30,
      timerDurationInSeconds: 900,
    },
  ];

  beforeEach(() => {
    processor = new SportsDataProcessor();
  });

  test("throws error when summary data is not loaded", () => {
    processor.loadSamplesData(samplesData);
    processor.loadLapsData(lapsData);
    expect(() => processor.process()).toThrow("Summary data not loaded.");
  });

  test("processes data correctly", () => {
    processor.loadSummaryData(summaryData);
    processor.loadSamplesData(samplesData);
    processor.loadLapsData(lapsData);

    const result: ProcessedData = processor.process();

    expect(result.activityOverview.userId).toBe("1234567890");
    expect(result.activityOverview.activityType).toBe("INDOOR_CYCLING");
    expect(result.laps.length).toBe(2);
    expect(result.laps[0].heartRateSamples.length).toBeGreaterThan(0);
    expect(result.laps[1].heartRateSamples.length).toBeGreaterThan(0);

    // Validate heart rate samples for the first lap
    const firstLapSamples = result.laps[0].heartRateSamples;
    expect(firstLapSamples[0].sampleIndex).toBe(0);
    expect(typeof firstLapSamples[0].heartRate).toBe("number");

    // Ensure no null or NaN values in heart rate samples
    firstLapSamples.forEach((sample) => {
      expect(sample.heartRate).not.toBeNull();
      expect(isNaN(sample.heartRate)).toBe(false);
    });
  });

  test("handles empty samples data", () => {
    processor.loadSummaryData(summaryData);
    processor.loadSamplesData([]);
    processor.loadLapsData(lapsData);

    const result: ProcessedData = processor.process();

    expect(result.laps.length).toBe(2);
    expect(result.laps[0].heartRateSamples.length).toBe(0);
    expect(result.laps[1].heartRateSamples.length).toBe(0);
  });

  test("handles invalid heart rate data", () => {
    // Introduce invalid data
    const invalidSamplesData = [...samplesData];
    invalidSamplesData[1].data = "abc,def,ghi";

    processor.loadSummaryData(summaryData);
    processor.loadSamplesData(invalidSamplesData);
    processor.loadLapsData(lapsData);

    const result: ProcessedData = processor.process();

    // The heart rate samples should be empty due to invalid data
    expect(result.laps[0].heartRateSamples.length).toBe(0);
  });
});
