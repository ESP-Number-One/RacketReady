import { Controller, Route, Example, Get, Path } from "tsoa";

interface Fruit {
  name: string;
  price: number;
}

const TEST: Record<string, Fruit> = {
  apple: {
    name: "Apple",
    price: 0.25,
  },
  banana: {
    name: "Banana",
    price: 0.45,
  },
  orange: {
    name: "Orange",
    price: 0.25,
  },
  coconut: {
    name: "Orange",
    price: 0.25,
  },
  grape: {
    name: "Grape",
    price: 0.005,
  },
};

@Route("fruits")
export class FruitController extends Controller {
  @Example<Fruit>({
    name: "Apple",
    price: 0.35,
  })
  @Get("{fruitId}")
  public getFruit(@Path() fruitId: string): Fruit {
    return TEST[fruitId];
  }

  @Get()
  public listFruits(): string[] {
    return Object.keys(TEST);
  }
}
