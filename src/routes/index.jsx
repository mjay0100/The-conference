import { SignedIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function IndexPage() {
  return (
    <div>
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl sm:py-6 ">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to THE Conference
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
              tenetur sed molestiae eos eaque reprehenderit aperiam consequuntur
              delectus a aut expedita fugiat autem sit, libero nesciunt
              distinctio repellendus incidunt, ipsam ratione repellat dicta
              praesentium fuga quae repudiandae! Magni, cum labore!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/sign-up"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
        <div
          className=" inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
}
