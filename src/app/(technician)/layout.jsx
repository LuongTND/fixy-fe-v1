"use client";

import React from "react";
import { Layout } from "antd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { FloatingActionButton } from "@/components/feature/home/FloatingActionButton";

const { Content } = Layout;

export default function TechnicianLayout({ children }) {
  return (
    <Layout className="min-h-screen !bg-background">
      <Header />
      <Content className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-5 md:px-6 lg:px-8 lg:py-8 pb-28 lg:pb-8">
        {children}
      </Content>
      <Footer />
      <MobileNav />
      <FloatingActionButton />
    </Layout>
  );
}
