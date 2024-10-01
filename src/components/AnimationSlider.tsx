import React, { useState, useEffect } from 'react';
import { Slider, Box, TextField, Typography } from '@mui/material';
import { Button } from '@mui/material';

const AnimationSlider = ({ animateCamera, stopAnimation, setAnimationTime }: any) => {
  const [sliderValue, setSliderValue] = useState<number>(0); // Value from 0 to 1 for the slider
  const [totalDuration, setTotalDuration] = useState<number>(10); // Total duration of animation in seconds
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationTime, setCurrentAnimationTime] = useState<number>(0); // Current time of animation

  // Handles slider changes from the user
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setSliderValue(newValue);
      const timeInSeconds = newValue * totalDuration;
      setCurrentAnimationTime(timeInSeconds);
      setAnimationTime(timeInSeconds); // Update animation to specific time
    }
  };

  // Handles total duration change from the user input
  const handleTotalDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseFloat(event.target.value);
    if (!isNaN(newDuration) && newDuration > 0) {
      setTotalDuration(newDuration);
    }
  };

  // Play or pause the animation
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      animateCamera(); // Start animation
    } else {
      stopAnimation(); // Stop animation
    }
  };

  // Update slider position as animation runs
  useEffect(() => {
    let animationInterval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      animationInterval = setInterval(() => {
        setCurrentAnimationTime(prevTime => {
          const newTime = prevTime + 0.1; // Increment the animation time by 0.1 seconds
          const newSliderValue = Math.min(newTime / totalDuration, 1); // Normalize time for slider (0 to 1)

          setSliderValue(newSliderValue);
          setAnimationTime(newTime); // Update animation state

          // Stop when animation reaches the end
          if (newTime >= totalDuration) {
            clearInterval(animationInterval!);
            setIsPlaying(false);
          }
          return newTime;
        });
      }, 100); // Update every 100ms (0.1 seconds)
    }

    // Clean up interval on unmount or when animation is stopped
    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [isPlaying, totalDuration, setAnimationTime]);

  return (
    <Box component='div' width={300} padding={2}>
      <Typography variant="h6">Camera Animation Control</Typography>

      {/* Slider */}
      <Slider
        value={sliderValue}
        onChange={handleSliderChange}
        step={0.01} // Step by 1% of the animation
        min={0}
        max={1}
        valueLabelDisplay="auto"
      />

      {/* Input to control total duration */}
      <TextField
        label="Total Duration (seconds)"
        value={totalDuration}
        onChange={handleTotalDurationChange}
        type="number"
        inputProps={{ step: 1, min: 1 }}
        margin="normal"
        fullWidth
      />

      <Typography variant="body1">
        Current Time: {Math.round(animationTime * 100) / 100} sec
      </Typography>

      <Button onClick={togglePlay} variant="contained" color="primary">
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
    </Box>
  );
};

export default AnimationSlider;
