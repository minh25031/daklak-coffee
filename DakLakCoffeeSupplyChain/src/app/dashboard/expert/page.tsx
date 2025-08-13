"use client";

import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Feather,
    BookOpen,
    AlertTriangle,
    BarChart3,
    ArrowRight,
    Users,
    FileText,
    MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function ExpertDashboard() {
    useAuthGuard(["expert"]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="p-6 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Feather className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng, Chuyên gia!</h1>
                        <p className="text-gray-600 text-lg">Quản lý và hỗ trợ nông dân trong chuỗi cung ứng cà phê</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Báo cáo chờ xử lý</p>
                                    <p className="text-2xl font-bold text-orange-600">12</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đã phản hồi</p>
                                    <p className="text-2xl font-bold text-green-600">45</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Bài viết đã viết</p>
                                    <p className="text-2xl font-bold text-blue-600">8</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Nông dân hỗ trợ</p>
                                    <p className="text-2xl font-bold text-purple-600">156</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-white/90 backdrop-blur-sm border-orange-200 hover:shadow-xl transition-all duration-300 group">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Feather className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-gray-800">Tư vấn kỹ thuật</CardTitle>
                                    <p className="text-gray-600 text-sm">Hỗ trợ kỹ thuật cho nông dân</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Phản hồi các yêu cầu tư vấn kỹ thuật từ nông dân, hỗ trợ giải quyết vấn đề trong quá trình canh tác và sơ chế cà phê.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>12 báo cáo chờ xử lý</span>
                                </div>
                                <Link href="/dashboard/expert/anomalies">
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white group-hover:bg-orange-700 transition-colors">
                                        Xem báo cáo
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300 group">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-gray-800">Viết bài chuyên môn</CardTitle>
                                    <p className="text-gray-600 text-sm">Chia sẻ kiến thức chuyên sâu</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Viết và chia sẻ các bài viết chuyên môn về kỹ thuật canh tác, sơ chế cà phê và kinh nghiệm thực tế.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <FileText className="w-4 h-4" />
                                    <span>8 bài viết đã viết</span>
                                </div>
                                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 group-hover:border-green-300 transition-colors">
                                    Viết bài mới
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-1">Đánh giá tiến độ</h3>
                                    <p className="text-gray-600 text-sm">Đánh giá quá trình canh tác và sơ chế theo từng mùa</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                    Xem chi tiết
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-1">Quản lý nông dân</h3>
                                    <p className="text-gray-600 text-sm">Theo dõi và hỗ trợ nông dân trong hệ thống</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                                    Xem danh sách
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-800">Hành động nhanh</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Xem báo cáo mới
                            </Button>
                            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Viết bài mới
                            </Button>
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Tạo báo cáo
                            </Button>
                            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                <Users className="w-4 h-4 mr-2" />
                                Liên hệ nông dân
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
