import {
  SummaryData,
  SampleData,
  LapData,
  ProcessedData,
  ProcessedLap,
  ProcessedHeartRateSample,
} from "./types";

export class SportsDataProcessor {
  private summaryData: SummaryData | null = null;
  private samplesData: SampleData[] = [];
  private lapsData: LapData[] = [];

  // load summary data
  loadSummaryData(data: SummaryData) {
    this.summaryData = data;
  }

  // load samples data
  loadSamplesData(data: SampleData[]) {
    this.samplesData = data;
  }

  // load laps data
  loadLapsData(data: LapData[]) {
    this.lapsData = data;
  }

  // process data
  process(): ProcessedData | any {
    if (!this.summaryData) {
      throw new Error("Summary data not loaded.");
    }

    const activityOverview = {
      userId: this.summaryData.userId,
      activityType: this.summaryData.activityType,
      deviceName: this.summaryData.deviceName,
      maxHeartRateInBeatsPerMinute:
        this.summaryData.maxHeartRateInBeatsPerMinute,
      durationInSeconds: this.summaryData.durationInSeconds,
    };

    const heartRateSamples = this.extractHeartRateSamples();

    const laps: ProcessedLap[] = this.lapsData.map((lap, index) => {
      const lapHeartRateSamples = heartRateSamples[index] || [];
      return {
        startTimeInSeconds: lap.startTimeInSeconds,
        totalDistanceInMeters: lap.totalDistanceInMeters,
        timerDurationInSeconds: lap.timerDurationInSeconds,
        heartRateSamples: lapHeartRateSamples,
      };
    });

    return {
      activityOverview,
      laps,
    };
  }

  // extract and process heart rate samples
  private extractHeartRateSamples(): ProcessedHeartRateSample[][] {
    const heartRateSamples: ProcessedHeartRateSample[][] = [];
    const heartRateSampleData = this.samplesData.filter(
      (sample) => sample["sample-type"] === "2"
    );

    // Process samples in pairs (two per lap)
    for (let i = 0; i < heartRateSampleData.length; i += 2) {
      const samplesForLap = heartRateSampleData.slice(i, i + 2);

      // Ensure we have two samples
      if (samplesForLap.length < 2) {
        heartRateSamples.push([]);
        continue;
      }

      const dataArrays = samplesForLap.map((sample) => {
        const data = sample.data.split(",");
        const cleanedData = this.cleanHeartRateData(data);
        return cleanedData;
      });

      // Check if any data arrays are empty (invalid data)
      if (dataArrays.some((arr) => arr.length === 0)) {
        heartRateSamples.push([]);
        continue;
      }

      const combinedData = dataArrays.flat();

      // Reverse aggregation and interpolate
      const interpolatedData = this.interpolateHeartRateData(combinedData);

      const processedSamples: ProcessedHeartRateSample[] = interpolatedData.map(
        (hr, index) => ({
          sampleIndex: index,
          heartRate: hr,
        })
      );

      heartRateSamples.push(processedSamples);
    }

    return heartRateSamples;
  }

  // clean heart rate data
  private cleanHeartRateData(data: string[]): number[] {
    return data
      .map((value) => (value === "null" ? null : Number(value)))
      .filter((value): value is number => value !== null && !isNaN(value));
  }

  // reverse aggregation and interpolate
  private interpolateHeartRateData(data: number[]): number[] {
    const interpolatedData: number[] = [];

    for (let i = 0; i < data.length - 1; i++) {
      const startValue = data[i];
      const endValue = data[i + 1];
      const step = (endValue - startValue) / 5;

      for (let j = 0; j < 5; j++) {
        const interpolatedValue = startValue + step * j;
        interpolatedData.push(Math.round(interpolatedValue));
      }
    }

    return interpolatedData;
  }
}
