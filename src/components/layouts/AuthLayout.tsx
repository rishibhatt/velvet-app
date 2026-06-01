"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";

const collageImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA7xLR0vT-Dx8AZi-fh_2cUVEfTUbuoGAmH7HtzHkC3A5T6T6c6gJrL2yHjiIiWCq3e2O3m-D6KUWl1VJ9sutZoynqYsuORsVDY6e2QHwfjVXKTFAXC-aF51JG6kQlf3sISXtKLCIEFoxLxbD_5BcGu8j7w8C_BiZRfMA3WgfmFWQCPbX6bPnqNyqOTP4Wk6oIoPjJZ8l5hgoTX6UVyyO9fXicXt_6-huJFoAgizFOOSZEFVbp5F8PRqZpcohuLrkXhg53Y0dNLGRhM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4dr3w0-TVlGM8ch7e9msTROVm1Gy1ARz9oB4OnJwEUZCn6XWjyz-pifS3ZFnDOyxMd06d6kPX156UDGG5dNhf1KLv2l-dzHyMg3RlLdZg9xMqfq4A5Nr2B1r9bPlT4HNr9XUE1-xcyLvdt4Ujr1dROC_i8DsZeesl0ighbi1GpQDr0-Uwsogc63e_8vbJKBdgGsQ3xhY_nyRAZg2r1IX65k_6Se5793wc16eFB_y0aiSiHb6tdBI9tyaC7B53kMY5S8jBivNANC8E",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD0W9mC3HOc0i6hxFj0LoWjnKZqWOEJ_VWtqEQfN2UGkaC8OQgjWRc59xOcJ_WgJm3JvumfJD1cmzC_apvi2ggH67bY-alZs7YFL2Bx0zbJ72D0wa417ZWHCZwwyV0pGe4t_uRoLZnwJZrfaniXacf719PFH4SeM_SJ6nnCCddAcyq11u2AUjgGEVf-U5cYon8RdBIoexYF4Pg9qzWyjgsrS27GaodPg8T4RKPJIkkwAeA7eRV2gf2qi6MCakaqlZFpVlbWz4kRyBrF",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYwcz0Rp2h-oXbY63FW-BBez-JJ3PRNMQBqCwl0yxGLpilPlNORRdI9X3xJDAOweeiGCAFLDiSawJmx_GfgmF_IJdbU9fp-CjjZn0lpPauwiOY2fn2x_Q1c_w1Ni0XX8mxOcX1M9HU9CdZ7oiLoTAYoFdxzAEmbtBSF6JQ0lCb09VdrAKZug5ottMcpQ6q4A5FW02SrZGuu1UTHusRGbyWTo8N9aQov79oo7jGI5pyvO3u0vJrOtWe6vwXzeYYITvA-EhJvJ77i26U",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCguCJu8rjWr20z2nF6jTzdYJ0WKptERhIDhIZTs5U8YFLjC4NKG_LV41h5SIyaj2zUWXDcbEl08VFx0Mgs861RNUOgEclQyZJ3Wf9YnJ72EZ2SX-fT93JWv8u0sk1PJVXu4fdHF8pXnTkMHTjvgNoJj4DjUKIVkzp_gqmlXdnZAAe43npTOJe8SztUml98u0OZ93uhjPdd9VMYkdm7thWL7x7yflq5O-jDM8-Mbu0-Ojnhpgqv_DqbSj62VvOmr1EUkhBKeBwCR0Md",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC6Xq14WtVRdJaXLMLmRuhb0YTgUrZjEFYL4XJz_ROD6x1QGimXoAEJhjF_XIfIrZ4Bc80smD5Np9WleA1XaGTWbpP34ZUs3sT-1Op9SH-fGfjnvvgp4YXcXLvldJBkK-UFyZhYRs9dfQBTNjJT6VArRT8_iNSecQhTcgcUkAK5-QPPJPSW5v5q6UELmXonVml5ClMS60wh8UfPUa9610SY-Lhq4hawuyM4NloJqRSGfKwRiCdbBJq8TjIOeV1eOpz2sp9sJYPqsInC",
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="columns-3 gap-3 p-6 pt-12">
          {collageImages.map((src, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.08 }}
              className="mb-3 break-inside-avoid overflow-hidden rounded-2xl"
            >
              <Image
                src={src}
                alt=""
                width={300}
                height={i % 2 === 0 ? 400 : 280}
                className="w-full object-cover"
              />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
      </div>
      <div className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-margin-mobile sm:py-12 lg:w-1/2">
        <motion.div
          className="w-full max-w-md"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
