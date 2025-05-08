export const scale = (value, smin, smax, tmin, tmax) => ((value - smin) * (tmax - tmin))
  / (smax - smin) + tmin;
