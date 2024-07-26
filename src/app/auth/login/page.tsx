"use client";

import React, {FormEvent, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {app} from "@/utils/firebase";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");

        try {
            const credential = await signInWithEmailAndPassword(
                getAuth(app),
                email,
                password
            );
            const idToken = await credential.user.getIdToken();

            await fetch("/api/login", {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            router.push("/");
        } catch (e) {
            setError((e as Error).message);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div
                className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 md:space-y-6"
                        action="#"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                        </div>
                        {error && (
                            <div
                                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                                role="alert"
                            >
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <div className="mb-5">
                            <input
                                type="submit"
                                value="Masuk"
                                className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                            />
                        </div>
                        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            Tidak Punya Akun?{" "}
                            <Link
                                href="/auth/register"
                                className="font-medium text-gray-600 hover:underline dark:text-gray-500"
                            >
                                Daftar disini
                            </Link>
                        </p>
                    </form>

                </div>
            </div>
        </main>
    );
}

export default Login;