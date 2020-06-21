import { Composer, OpenTag, Attribute } from "./composer.ts";
import { Feed, isDateField, Field } from "../types/atom.ts";

export class AtomComposer implements Composer {
  constructor(private complete: (feed: Feed) => void) {
  }
  private stack: any[] = [{}];
  private valueNode: string | null = null;

  onOpenTag = (node: OpenTag): void => {
    this.stack.push({});
  };
  onCloseTag = (nodeName: string): void => {
    let node = this.stack.pop();

    if (this.stack.length === 0) {
      this.complete(node);
      return;
    }

    if (this.valueNode != null) {
      if (isDateField(nodeName)) {
        node = new Date(this.valueNode);
      } else {
        node = this.valueNode.trim();
      }

      this.valueNode = null;
    }

    let propertyName;
    let isArrayNode = false;
    switch (nodeName) {
      case Field.Category:
        propertyName = "categories";
        isArrayNode = true;
        break;
      case Field.Contributer:
        propertyName = "contributers";
        isArrayNode = true;
        break;
      case Field.Link:
        propertyName = "links";
        isArrayNode = true;
        break;
      case Field.Entry:
        propertyName = "entries";
        isArrayNode = true;
        break;
      default:
        propertyName = nodeName.toLowerCase();
    }

    const parentNode = this.stack[this.stack.length - 1];
    if (isArrayNode) {
      if (!parentNode[propertyName]) {
        parentNode[propertyName] = [];
      }

      parentNode[propertyName].push(node);
    } else {
      parentNode[propertyName] = node;
    }
  };

  onAttribute = (attr: Attribute): void => {
    let value: string | Date = attr.value.trim();
    if (isDateField(attr.name)) {
      value = new Date(attr.value);
    }

    this.stack[this.stack.length - 1][attr.name.toLowerCase()] = value;
  };
  onCData = (text: string): void => {
    this.valueNode = text;
  };
  onText = (text: string): void => {
    this.valueNode = text;
  };
}