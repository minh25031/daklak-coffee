import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { motion, Variants } from "motion/react";

const LoadingDots = () => {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>{".".repeat(dotCount)}</span>;
};

function LoadingThreeDotsJumping() {
  const dotVariants: Variants = {
    jump: {
      y: -10,
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      animate='jump'
      transition={{ staggerChildren: 0.2 }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        height: 20,
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={dotVariants}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#fff",
            willChange: "transform",
          }}
        />
      ))}
    </motion.div>
  );
}

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading: boolean;
  children?: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  ...props
}) => {
  return (
    <Button
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingThreeDotsJumping />
        </>
      ) : (
        children
      )}
    </Button>
  );
};
