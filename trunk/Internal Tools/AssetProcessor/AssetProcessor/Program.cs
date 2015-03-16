using System;
using System.Threading;

namespace AssetProcessor
{
	class Program
	{
		static void Main(string[] args)
		{
			ConsoleKeyInfo key;

			if (!AssetProcessor.ValidateFolders())
			{
				Console.WriteLine("Folders not found. Executable is probably not in the right folder: AssetsRepo.");
				Console.ReadKey();
				return;
			}

			do
			{
				Console.Clear();
				Console.WriteLine("Asset Processor:");
				Console.WriteLine("1. ScaleUp");
				Console.WriteLine("2. ScaleDown");
				Console.WriteLine("3. Deploy");
				Console.WriteLine("Q. Quit");

				Console.Write("Enter choice: ");

				key = Console.ReadKey(false);
				int errors = 0;

				Console.WriteLine();

				switch (key.Key)
				{
					case ConsoleKey.D1:

						Console.WriteLine("\nScaling up is BAD! Are you sure? Press Y to confirm.");
						if (Console.ReadKey().Key != ConsoleKey.Y)
							continue;

						Console.WriteLine("\nProcessing: 2.0\n"); Thread.Sleep(750);
						errors += AssetProcessor.Scale("1.0", "2.0", 2.0f, AssetProcessor.ScaleAction.Multiply);
						Console.WriteLine("\nProcessing: 3.0\n"); Thread.Sleep(750);
						errors += AssetProcessor.Scale("1.0", "3.0", 3.0f, AssetProcessor.ScaleAction.Multiply);

						PrintFinish(errors);

						break;

					case ConsoleKey.D2:

						Console.WriteLine("\nProcessing: 2.0\n"); Thread.Sleep(750);
						errors += AssetProcessor.Scale("3.0", "2.0", 1.5f, AssetProcessor.ScaleAction.Divide);
						Console.WriteLine("\nProcessing: 1.0\n"); Thread.Sleep(750);
						errors += AssetProcessor.Scale("3.0", "1.0", 3.0f, AssetProcessor.ScaleAction.Divide);

						PrintFinish(errors);

						break;

					case ConsoleKey.D3:

						Console.Clear();
						Console.WriteLine("Deploy options:");
						Console.WriteLine("1. Scale 1.0");
						Console.WriteLine("2. Scale 2.0");
						Console.WriteLine("3. Scale 3.0");
						Console.WriteLine("Any. Back");

						var deployKey = Console.ReadKey(false);
						Console.WriteLine();

						switch (deployKey.Key)
						{
							case ConsoleKey.D1:
								errors += AssetProcessor.Deploy("1.0");

								PrintFinish(errors);
								break;
							case ConsoleKey.D2:
								errors += AssetProcessor.Deploy("2.0");

								PrintFinish(errors);
								break;
							case ConsoleKey.D3:
								errors += AssetProcessor.Deploy("3.0");

								PrintFinish(errors);
								break;
						}


						break;
				}



				

			} while (key.Key != ConsoleKey.Q);
		}


		private static void PrintFinish(int errors)
		{
			Console.WriteLine();

			if (errors > 0)
			{
				ConsoleColor origColor = Console.ForegroundColor;

				Console.ForegroundColor = ConsoleColor.Red;
				Console.WriteLine("Errors found: {0}", errors);

				Console.ForegroundColor = origColor;
			}

			Console.WriteLine("Press any key to continue...");
			Console.ReadKey(true);
		}
	}
}
